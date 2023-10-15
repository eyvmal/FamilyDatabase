import React, { useState, useEffect } from 'react';
import { Box, Avatar, Grid, Typography, IconButton, Tabs, Tab } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import img1 from './pictures/img1.jpeg';
import img2 from './pictures/img2.jpeg';
import "./ProfilePage.css";

const computeAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const ProfilePage = () => {
    const [person, setPerson] = useState(null);
    const [relation, setRelations] = useState(null);
    const [value, setValue] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 700;
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const age = person && person.birth ? computeAge(person.birth) : null;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const personID = new URLSearchParams(window.location.search).get('id');
        fetch(`http://localhost:4000/p?id=${personID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response error: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.id) {
                    setPerson(data);
                    console.log(`Page loaded for person with ID ${data.id}`)
                } else {
                    console.error('No match found for the provided ID');
                }
            })
            .catch(error => console.error('Error fetching person:', error));
    }, []);

    useEffect(() => {
        const personID = new URLSearchParams(window.location.search).get('id');
        fetch(`http://localhost:4000/r?id=${personID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response error: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data != null) {
                    setRelations(data);
                    console.log(`Fetched relations for ID ${data.id}`)
                } else {
                    console.error('No relations found for this person');
                }
            })
            .catch(error => console.error('Error fetching relations:', error));
    }, []);

    if (!person) {
        return <div>Loading...</div>;
    }

    return (
        <Box className="root">
            <IconButton 
                style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }} 
                onClick={() => window.location.href = '/'}
            >
                <ArrowBackIosIcon />
            </IconButton>
            <Box
                className="imageBackground"
                style={{ backgroundImage: `url(${img1})` }}
            >
                <Avatar
                    src={img2}
                    alt="ProfilePicture"
                    id="profileAvatar"
                    className="avatar"
                />
            </Box>
            {isMobile ? (
                <>
                    <Tabs value={value} onChange={handleChange} centered className="tabs">
                        <Tab label="Beskrivelse" className="tabLeft" />
                        <Tab label="Detaljer" className="tabRight" />
                    </Tabs>
                    <Box className="mobileHeader">
                        <Typography><strong>{`${person.firstname} ${person.lastname}`}</strong></Typography>
                    </Box>

                    {value === 0 && (
                        <Grid item xs={12} className="gridItem">
                            <Box display="flex" flexDirection="column">
                                {person.description && (<Typography>{person.description}</Typography>)}
                            </Box>
                        </Grid>
                    )}

                    {value === 1 && (
                      <Grid item xs={12} className="gridItem">
                          <Box display="flex" flexDirection="column">
                            {age && <Typography><strong>Alder:</strong> {age}</Typography>}
                            {person.birth && <Typography><strong>Født:</strong> {new Date(person.birth).toLocaleDateString()}</Typography>}
                            {person.birthplace && <Typography><strong>Fødested:</strong> {person.birthplace}</Typography>}
                            {person.residence && <Typography><strong>Bolig:</strong> {person.residence}</Typography>}
                            {relation && relation.dad && relation.dad.length > 0 && (
                                <div>
                                    <Typography component="div"><strong>Far:</strong></Typography>
                                    <ul>
                                        {relation.dad.map(d => 
                                            <li key={d.id}><a href={`profile?id=${d.id}`}>{d.name}</a></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {relation && relation.mom && relation.mom.length > 0 && (
                                <div>
                                    <Typography component="div"><strong>Mor:</strong></Typography>
                                    <ul>
                                        {relation.mom.map(m => 
                                            <li key={m.id}><a href={`profile?id=${m.id}`}>{m.name}</a></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {relation && relation.partner && relation.partner.length > 0 && (
                                <div>
                                    <Typography component="div"><strong>Bedre halvdel:</strong></Typography>
                                    <ul>
                                        {relation.partner.map(p => 
                                            <li key={p.id}><a href={`profile?id=${p.id}`}>{p.name}</a></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {relation && relation.children && relation.children.length > 0 && (
                                <div>
                                    <Typography component="div"><strong>Barn:</strong></Typography>
                                    <ul>
                                        {relation.children.map(c => 
                                            <li key={c.id}><a href={`profile?id=${c.id}`}>{c.name}</a></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {relation && relation.siblings && relation.siblings.length > 0 && (
                                <div>
                                    <Typography component="div"><strong>Søsken:</strong></Typography>
                                    <ul>
                                        {relation.siblings.map(s => 
                                            <li key={s.id}><a href={`profile?id=${s.id}`}>{s.name}</a></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                          </Box>
                      </Grid>
                    )}
                </>
            ) : (
                <>
                    <Grid container className="gridContainer" spacing={2}>
                        <Grid item xs={8}>
                            <Typography variant="h6"><strong>{`${person.firstname} ${person.lastname}`}</strong></Typography>
                            {person.description && (<Typography>{person.description}</Typography>)}
                        </Grid>
                        <Grid item xs={4}>
                            <Box className="detailsBox">
                                <Typography variant="h6">Detaljer</Typography>
                                {age && <Typography><strong>Alder:</strong> {age}</Typography>}
                                {person.birth && <Typography><strong>Født:</strong> {new Date(person.birth).toLocaleDateString()}</Typography>}
                                {person.birthplace && <Typography><strong>Fødested:</strong> {person.birthplace}</Typography>}
                                {person.residence && <Typography><strong>Bolig:</strong> {person.residence}</Typography>}
                                {relation && relation.dad && relation.dad.length > 0 && (
                                    <div>
                                        <Typography component="div"><strong>Far:</strong></Typography>
                                        <ul>
                                            {relation.dad.map(d => 
                                                <li key={d.id}><a href={`profile?id=${d.id}`}>{d.name}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {relation && relation.mom && relation.mom.length > 0 && (
                                    <div>
                                        <Typography component="div"><strong>Mor:</strong></Typography>
                                        <ul>
                                            {relation.mom.map(m => 
                                                <li key={m.id}><a href={`profile?id=${m.id}`}>{m.name}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {relation && relation.partner && relation.partner.length > 0 && (
                                    <div>
                                        <Typography component="div"><strong>Bedre halvdel:</strong></Typography>
                                        <ul>
                                            {relation.partner.map(p => 
                                                <li key={p.id}><a href={`profile?id=${p.id}`}>{p.name}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {relation && relation.children && relation.children.length > 0 && (
                                    <div>
                                        <Typography component="div"><strong>Barn:</strong></Typography>
                                        <ul>
                                            {relation.children.map(c => 
                                                <li key={c.id}><a href={`profile?id=${c.id}`}>{c.name}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {relation && relation.siblings && relation.siblings.length > 0 && (
                                    <div>
                                        <Typography component="div"><strong>Søsken:</strong></Typography>
                                        <ul>
                                            {relation.siblings.map(s => 
                                                <li key={s.id}><a href={`profile?id=${s.id}`}>{s.name}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default ProfilePage;
