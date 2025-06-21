const graphql = require("graphql");

const { GraphQLInputObjectType, GraphQLString, GraphQLID, GraphQLInt } = graphql;

const TreatmentInput = new GraphQLInputObjectType({
  name: "TreatmentInput",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    name: { type: GraphQLString },
    price: { type: GraphQLInt },
    duration: { type: GraphQLInt },
  }),
});

module.exports = TreatmentInput;