const { GraphQLObjectType, GraphQLList, GraphQLString } = require("graphql");
const AppointmentType = require("./types/AppointmentType");
const Appointment = require("../models/appointment");

const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    appointments: {
      type: new GraphQLList(AppointmentType),
      resolve: async () => {
        const appointments = await Appointment.find();
        return appointments;
      },
    },
    appointment: {
      type: AppointmentType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const appointment = await Appointment.findById(args.id);
        return appointment;
      },
    },
  },
});

module.exports = Query;