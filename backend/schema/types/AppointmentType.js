const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
} = require("graphql");

const AppointmentType = new GraphQLObjectType({
  name: "Appointment",
  fields: () => ({
    id: { type: GraphQLID },
    patientId: { type: GraphQLString },
    clinicianId: { type: GraphQLString },
    appointment_date: { type: GraphQLString },
    chosen_slot: { type: GraphQLString },
    book_status: { type: GraphQLString },
    personal_details: { type: GraphQLString },
    meeting_link: { type: GraphQLString },
    confirmed: { type: GraphQLBoolean },
  }),
});

module.exports = AppointmentType;