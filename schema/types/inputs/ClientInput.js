const graphql = require("graphql");

const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

const ClientInput = new GraphQLInputObjectType({
  name: "ClientInput",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    password: { type: GraphQLString },
    squareCustomerId: { type: GraphQLString },
    unsavedSquareCardIDs: { type: new GraphQLList(GraphQLString) },
    tokenCount: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
  }),
});

module.exports = ClientInput;