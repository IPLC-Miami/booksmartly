const { GraphQLObjectType } = require("graphql");
const confirmAppointment = require("./mutations/confirmAppointmentMutation");
const deleteAppointment = require("./mutations/deleteAppointmentMutation");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    confirmAppointment,
    deleteAppointment,
  },
});

module.exports = Mutation;