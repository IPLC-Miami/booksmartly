const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");
const AppointmentType = require("../types/AppointmentType");
const Appointment = require("../../models/appointment");

const confirmAppointment = {
  type: AppointmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    confirmed: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  resolve: async (parent, args) => {
    const appointment = await Appointment.findById(args.id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    appointment.confirmed = args.confirmed;
    await appointment.save();
    return appointment;
  },
};

module.exports = confirmAppointment;