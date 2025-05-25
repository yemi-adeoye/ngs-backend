import dotenv from 'dotenv'

export const configuration = () => {
  // dotenv.configDotenv({ path: './.docker.env' }) // use for deploying to docker
  // dotenv.configDotenv({ path: './.k8.env' }) // use for deploying to docker
  dotenv.configDotenv({ path: '.env' }) // use for local development
}
