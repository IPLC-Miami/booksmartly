const graphql = require("graphql");

const { GraphQLInputObjectType, GraphQLString, GraphQLID } = graphql;

const MyRoutineFieldsInputType = new GraphQLInputObjectType({
  name: "MyRoutineFieldsInputType",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    name: { type: GraphQLString },
    frequency: { type: GraphQLString },
    useNotes: { type: GraphQLString },
    link: { type: GraphQLString },
  }),
});

module.exports = MyRoutineFieldsInputType;