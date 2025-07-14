import Constants from "expo-constants";

const ENV = {
 dev: {
   supabaseUrl: 'https://qmalgysggobkgcfgywca.supabase.co',
   supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYWxneXNnZ29ia2djZmd5d2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0ODIzNiwiZXhwIjoyMDY2OTI0MjM2fQ.h_ZUY9mPRtFZgVDCXN7O00TYPl9Gi4-rt_xPGqA2N30'
 },
 staging: {
   supabaseUrl: 'https://qmalgysggobkgcfgywca.supabase.co',
   supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYWxneXNnZ29ia2djZmd5d2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0ODIzNiwiZXhwIjoyMDY2OTI0MjM2fQ.h_ZUY9mPRtFZgVDCXN7O00TYPl9Gi4-rt_xPGqA2N30'
 },
 prod: {
   supabaseUrl: 'https://qmalgysggobkgcfgywca.supabase.co',
   supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYWxneXNnZ29ia2djZmd5d2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0ODIzNiwiZXhwIjoyMDY2OTI0MjM2fQ.h_ZUY9mPRtFZgVDCXN7O00TYPl9Gi4-rt_xPGqA2N30'
   // Add other keys you want here
 }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
 // What is __DEV__ ?
 // This variable is set to true when react-native is running in Dev mode.
 // __DEV__ is true when run locally, but false when published.
 if (__DEV__) {
   return ENV.dev;
 } else if (env === 'staging') {
   return ENV.staging;
 } else if (env === 'prod') {
   return ENV.prod;
 }
 // Fallback to production environment if no other condition is met.
 // This makes the function more robust and prevents crashes.
 return ENV.prod;
};

export default getEnvVars;