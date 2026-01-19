// import React from 'react';
// import { 
//   Grid, 
//   Card, 
//   CardContent, 
//   Typography, 
//   Button,
//   Box,
//   Chip
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { useQuery } from 'react-query';
// import axios from 'axios';
// import AddIcon from '@mui/icons-material/Add';
// import EnvironmentIcon from '@mui/icons-material/Cloud';

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const { data: environments = [], isLoading } = useQuery(
//     'environments',
//     async () => {
//       const response = await axios.get('/api/config/environments');
//       return response.data;
//     }
//   );

//   const { data: allConfigs = [] } = useQuery(
//     'allConfigs',
//     async () => {
//       const response = await axios.get('/api/config');
//       return response.data;
//     }
//   );

//   const getConfigCountByEnvironment = (env) => {
//     return allConfigs.filter(config => config.environment === env).length;
//   };

//   const predefinedEnvironments = ['development', 'staging', 'production'];
//   const allEnvironments = [...new Set([...predefinedEnvironments, ...environments])];

//   if (isLoading) {
//     return <Typography>Loading...</Typography>;
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Configuration Dashboard
//       </Typography>
      
//       <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
//         Manage your environment variables across different environments
//       </Typography>

//       <Grid container spacing={3}>
//         {allEnvironments.map((env) => {
//           const configCount = getConfigCountByEnvironment(env);
//           const exists = environments.includes(env);
          
//           return (
//             <Grid item xs={12} sm={6} md={4} key={env}>
//               <Card 
//                 className="environment-card"
//                 onClick={() => navigate(`/config/${env}`)}
//                 sx={{ 
//                   height: '100%',
//                   opacity: exists ? 1 : 0.7,
//                   border: exists ? '2px solid #1976d2' : '1px solid #ddd'
//                 }}
//               >
//                 <CardContent>
//                   <Box display="flex" alignItems="center" mb={2}>
//                     <EnvironmentIcon color="primary" sx={{ mr: 1 }} />
//                     <Typography variant="h6" component="div">
//                       {env.charAt(0).toUpperCase() + env.slice(1)}
//                     </Typography>
//                   </Box>
                  
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     {exists ? `${configCount} configurations` : 'No configurations yet'}
//                   </Typography>
                  
//                   <Box mt={2}>
//                     {exists ? (
//                       <Chip 
//                         label="Active" 
//                         color="success" 
//                         size="small" 
//                       />
//                     ) : (
//                       <Chip 
//                         label="Create New" 
//                         color="primary" 
//                         size="small" 
//                         icon={<AddIcon />}
//                       />
//                     )}
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           );
//         })}
//       </Grid>

//       <Box mt={4}>
//         <Typography variant="h6" gutterBottom>
//           Quick Actions
//         </Typography>
//         <Button 
//           variant="outlined" 
//           startIcon={<AddIcon />}
//           onClick={() => navigate('/config/development')}
//           sx={{ mr: 2 }}
//         >
//           Add Development Config
//         </Button>
//         <Button 
//           variant="outlined" 
//           startIcon={<AddIcon />}
//           onClick={() => navigate('/config/production')}
//         >
//           Add Production Config
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;
