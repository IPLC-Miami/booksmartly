const graphql = require("graphql");

const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

const AppointmentInput = new GraphQLInputObjectType({
  name: "AppointmentInput",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    date: { type: GraphQLString },
    startTime: { type: GraphQLString },
    morningOrEvening: { type: GraphQLString },
    endTime: { type: GraphQLString },
    duration: { type: GraphQLInt },
    price: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    esthetician: { type: GraphQLString },
    treatments: { type: new GraphQLList(GraphQLString) },
    addOns: { type: new GraphQLList(GraphQLString) },
    notes: { type: GraphQLString },
    confirmed: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
  }),
});

module.exports = AppointmentInput;