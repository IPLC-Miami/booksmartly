const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const Query = require("./Query");
const Mutation = require("./mutations");

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});