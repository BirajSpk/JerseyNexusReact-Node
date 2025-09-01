import WebSocketService from '../../services/websocket';

// Action types
export const AUTH_SET_LOADING = 'auth/setLoading';
export const AUTH_SET_ERROR = 'auth/setError';
export const AUTH_LOGIN_SUCCESS = 'auth/loginSuccess';
export const AUTH_LOGOUT = 'auth/logout';
export const AUTH_UPDATE_PROFILE = 'auth/updateProfile';
export const AUTH_CLEAR_ERROR = 'auth/clearError';

// Helper function to safely get data from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

// Action creators
export const setLoading = (loading) => ({ type: AUTH_SET_LOADING, payload: loading });
export const setError = (error) => ({ type: AUTH_SET_ERROR, payload: error });
export const loginSuccess = (data) => ({ type: AUTH_LOGIN_SUCCESS, payload: data });
export const logout = () => ({ type: AUTH_LOGOUT });
export const updateProfile = (data) => ({ type: AUTH_UPDATE_PROFILE, payload: data });
export const clearError = () => ({ type: AUTH_CLEAR_ERROR });

// Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_SET_LOADING:
      return { ...state, loading: action.payload };

    case AUTH_SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case AUTH_LOGIN_SUCCESS:
      // Store both token and user data in localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // Connect to WebSocket
      WebSocketService.connect(action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_LOGOUT:
      // Remove both token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Disconnect from WebSocket
      WebSocketService.disconnect();
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_UPDATE_PROFILE:
      const updatedUser = { ...state.user, ...action.payload };
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { ...state, user: updatedUser };

    case AUTH_CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

export default authReducer;