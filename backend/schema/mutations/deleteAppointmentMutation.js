const {
  GraphQLNonNull,
  GraphQLString,
} = require("graphql");
const AppointmentType = require("../types/AppointmentType");
const Appointment = require("../../models/appointment");

const deleteAppointment = {
  type: AppointmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const appointment = await Appointment.findById(args.id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    await appointment.remove();
    return appointment;
  },
};

module.exports = deleteAppointment;