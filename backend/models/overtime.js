const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
} = require("graphql");

const OvertimeType = new GraphQLObjectType({
  name: "Overtime",
  fields: () => ({
    id: { type: GraphQLID },
    clinicianId: { type: GraphQLString },
    date: { type: GraphQLString },
    startTime: { type: GraphQLString },
    endTime: { type: GraphQLString },
    isOvertime: { type: GraphQLBoolean },
  }),
});

module.exports = OvertimeType;