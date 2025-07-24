import { registerAs } from "@nestjs/config";

//! approach 2, with this I keep the function that returns the object outside,
//! so that I can create a type from it
//! for the case where I want to use it in some service
//! for this project it's not necessary, but I left it
const jwtConfig = () => {
  return {
    secret: process.env.JWT_SECRET_KEY,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION ?? "3600"),
    jwtRefreshExpires: parseInt(process.env.JWT_REFRESH_EXPIRATION ?? "86400"),
  };
};

export type jwtConfigType = ReturnType<typeof jwtConfig>;

export default registerAs('jwt', jwtConfig)

// import { registerAs } from "@nestjs/config";

// export default registerAs('jwt', () => {
//   return {
//     secret: process.env.JWT_TOKEN_SECRET,
//     audience: process.env.JWT_TOKEN_AUDIENCE,
//     issuer: process.env.JWT_TOKEN_ISSUER,
//     expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION ?? "3600"),
//     jwtRefreshExpires: parseInt(process.env.JWT_REFRESH_EXPIRATION ?? "86400"),
//   };
// })
