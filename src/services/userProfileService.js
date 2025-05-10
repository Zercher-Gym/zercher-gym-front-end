import axios from 'axios';

// Endpoint-ul corect pentru obtinerea profilului utilizatorului din Swagger
const PROFILE_URL = '/api/user/profile';

/* For testing purposes, let's hardcode admin role
// This is a temporary solution until we figure out the correct endpoint
const setHardcodedAdminRole = () => {
  console.log('Setting hardcoded admin role for testing');
  sessionStorage.setItem('userRoles', JSON.stringify(['ADMIN', 'ROLE_ADMIN']));
};
*/

// Function to fetch user profile
export const fetchUserProfile = async () => {
  console.log(`Fetching user profile from: ${PROFILE_URL}`);
  
  try {
    const response = await axios.get(PROFILE_URL);
    console.log('Profile response:', response.data);
    
    // Based on Swagger, the response should contain 'roles'
    if (response.data && response.data.data && response.data.data.roles) {
      console.log('Roles found in response:', response.data.data.roles);
      sessionStorage.setItem('userRoles', JSON.stringify(response.data.data.roles));
      return response.data;
    } else {
      console.log('No role information found in response');
      // Folosim un array gol pentru roluri
      sessionStorage.setItem('userRoles', JSON.stringify([]));
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile from ${PROFILE_URL}:`, error.message);
    console.log('Could not fetch user profile, using empty roles array');
    // Folosim un array gol pentru roluri
    sessionStorage.setItem('userRoles', JSON.stringify([]));
    return { roles: [] };
  }
};

// Functie pentru a verifica daca utilizatorul are un anumit rol
export const hasRole = (roleToCheck) => {
  const rolesString = sessionStorage.getItem('userRoles');
  if (!rolesString) return false;
  
  try {
    const roles = JSON.parse(rolesString);
    return roles.includes(roleToCheck);
  } catch (e) {
    console.error('Error parsing user roles:', e);
    return false;
  }
};

// Functie pentru a verifica daca utilizatorul are oricare dintre rolurile specificate
export const hasAnyRole = (rolesToCheck) => {
  const rolesString = sessionStorage.getItem('userRoles');
  if (!rolesString) return false;
  
  try {
    const roles = JSON.parse(rolesString);
    return rolesToCheck.some(role => roles.includes(role));
  } catch (e) {
    console.error('Error parsing user roles:', e);
    return false;
  }
};
