import axios from 'axios';

// Endpoint to retrieve all units
// Expected response structure:
// {
//   data: [ { id: 123, code: 'REP', type: 'GROUP' }, ... ],
//   success: true,
//   error: null
// }
const UNIT_URL = '/api/unit';

export const fetchUnits = () => axios.get(UNIT_URL);
