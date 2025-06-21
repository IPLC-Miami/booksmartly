const graphql = require("graphql");

const { GraphQLInputObjectType, GraphQLString, GraphQLID, GraphQLInt } = graphql;

const AddOnInput = new GraphQLInputObjectType({
  name: "AddOnInput",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    name: { type: GraphQLString },
    price: { type: GraphQLInt },
    duration: { type: GraphQLInt },
  }),
});

module.exports = AddOnInput;