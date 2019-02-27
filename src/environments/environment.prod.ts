export const environment = {
  production: true,
  VERSION: require('../../package.json').version,
  API_KEY: `${process.env.TRELLO_API_KEY}`,
};