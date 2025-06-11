import React, { useState, useEffect } from 'react';
import { Box, Button, Card, Flex, Text, Dialog, TextField, Select, Badge } from '@radix-ui/themes';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getDoctorSlots,
  createDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
  getClinicians,
  validateScheduleData,
  validateDoctorSlotData
} from '../../utils/scheduleApi';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    clinician_id: '',
    date: '',
    start_time: '',
    end_time: '',
    is_available: true
  });

  const [slotForm, setSlotForm] = useState({
    schedule_id: '',
    start_time: '',
    end_time: '',
    is_booked: false,
    patient_name: '',
    patient_email: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, slotsData, cliniciansData] = await Promise.all([
        getSchedules(),
        getDoctorSlots(),
        getClinicians()
      ]);
      
      setSchedules(schedulesData);
      setDoctorSlots(slotsData);
      setClinicians(cliniciansData);
    } catch (err) {
      setError('Failed to load schedule data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleForm);
      } else {
        await createSchedule(scheduleForm);
      }
      
      setShowScheduleDialog(false);
      setEditingSchedule(null);
      setScheduleForm({
        clinician_id: '',
        date: '',
        start_time: '',
        end_time: '',
        is_available: true
      });
      await loadData();
    } catch (err) {
      setError('Failed to save schedule: ' + err.message);
    }
  };

  const handleCreateSlot = async () => {
    try {
      if (editingSlot) {
        await updateDoctorSlot(editingSlot.id, slotForm);
      } else {
        await createDoctorSlot(slotForm);
      }
      
      setShowSlotDialog(false);
      setEditingSlot(null);
      setSlotForm({
        schedule_id: '',
        start_time: '',
        end_time: '',
        is_booked: false,
        patient_name: '',
        patient_email: ''
      });
      await loadData();
    } catch (err) {
      setError('Failed to save slot: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete schedule: ' + err.message);
      }
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await deleteDoctorSlot(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete slot: ' + err.message);
      }
    }
  };

  const openEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      clinician_id: schedule.clinician_id,
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available
    });
    setShowScheduleDialog(true);
  };

  const openEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      schedule_id: slot.schedule_id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_booked: slot.is_booked,
      patient_name: slot.patient_name || '',
      patient_email: slot.patient_email || ''
    });
    setShowSlotDialog(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box p="4">
        <Text>Loading schedule data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="4">
        <Text color="red">Error: {error}</Text>
        <Button onClick={loadData} mt="2">Retry</Button>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4">
        <Text size="6" weight="bold">Schedule Management</Text>
        <Flex gap="2">
          <Button onClick={() => setShowScheduleDialog(true)}>
            Add Schedule
          </Button>
          <Button onClick={() => setShowSlotDialog(true)}>
            Add Time Slot
          </Button>
        </Flex>
      </Flex>

      {/* Schedules Section */}
      <Box mb="6">
        <Text size="4" weight="bold" mb="3">Clinician Schedules</Text>
        <Flex direction="column" gap="3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} p="3">
              <Flex justify="between" align="center">
                <Box>
                  <Text weight="bold">{schedule.clinician_name}</Text>
                  <Text size="2" color="gray">
                    {formatDate(schedule.date)} • {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </Text>
                  <Badge color={schedule.is_available ? 'green' : 'red'} mt="1">
                    {schedule.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </Box>
                <Flex gap="2">
                  <Button size="1" onClick={() => openEditSchedule(schedule)}>
                    Edit
                  </Button>
                  <Button size="1" color="red" onClick={() => handleDeleteSchedule(schedule.id)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
          {schedules.length === 0 && (
            <Text color="gray">No schedules found. Create one to get started.</Text>
          )}
        </Flex>
      </Box>

      {/* Doctor Slots Section */}
      <Box>
        <Text size="4" weight="bold" mb="3">Time Slots</Text>
        <Flex direction="column" gap="3">
          {doctorSlots.map((slot) => (
            <Card key={slot.id} p="3">
              <Flex justify="between" align="center">
                <Box>
                  <Text weight="bold">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </Text>
                  <Text size="2" color="gray">
                    Schedule: {slot.schedule_date} • {slot.clinician_name}
                  </Text>
                  {slot.is_booked && (
                    <Text size="2" color="blue">
                      Patient: {slot.patient_name} ({slot.patient_email})
                    </Text>
                  )}
                  <Badge color={slot.is_booked ? 'blue' : 'green'} mt="1">
                    {slot.is_booked ? 'Booked' : 'Available'}
                  </Badge>
                </Box>
                <Flex gap="2">
                  <Button size="1" onClick={() => openEditSlot(slot)}>
                    Edit
                  </Button>
                  <Button size="1" color="red" onClick={() => handleDeleteSlot(slot.id)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
          {doctorSlots.length === 0 && (
            <Text color="gray">No time slots found. Create some to manage appointments.</Text>
          )}
        </Flex>
      </Box>

      {/* Schedule Dialog */}
      <Dialog.Root open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {editingSchedule ? 'Update the schedule details.' : 'Create a new schedule for a clinician.'}
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Clinician</Text>
              <Select.Root 
                value={scheduleForm.clinician_id} 
                onValueChange={(value) => setScheduleForm({...scheduleForm, clinician_id: value})}
              >
                <Select.Trigger placeholder="Select clinician" />
                <Select.Content>
                  {clinicians.map((clinician) => (
                    <Select.Item key={clinician.user_id} value={clinician.user_id}>
                      {clinician.first_name} {clinician.last_name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">Date</Text>
              <TextField.Input
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">Start Time</Text>
              <TextField.Input
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">End Time</Text>
              <TextField.Input
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">Available</Text>
              <Select.Root 
                value={scheduleForm.is_available.toString()} 
                onValueChange={(value) => setScheduleForm({...scheduleForm, is_available: value === 'true'})}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="true">Available</Select.Item>
                  <Select.Item value="false">Unavailable</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleCreateSchedule}>
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Slot Dialog */}
      <Dialog.Root open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>{editingSlot ? 'Edit Time Slot' : 'Create Time Slot'}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {editingSlot ? 'Update the time slot details.' : 'Create a new time slot within a schedule.'}
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Schedule</Text>
              <Select.Root 
                value={slotForm.schedule_id} 
                onValueChange={(value) => setSlotForm({...slotForm, schedule_id: value})}
              >
                <Select.Trigger placeholder="Select schedule" />
                <Select.Content>
                  {schedules.map((schedule) => (
                    <Select.Item key={schedule.id} value={schedule.id}>
                      {schedule.clinician_name} - {formatDate(schedule.date)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">Start Time</Text>
              <TextField.Input
                type="time"
                value={slotForm.start_time}
                onChange={(e) => setSlotForm({...slotForm, start_time: e.target.value})}
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">End Time</Text>
              <TextField.Input
                type="time"
                value={slotForm.end_time}
                onChange={(e) => setSlotForm({...slotForm, end_time: e.target.value})}
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">Status</Text>
              <Select.Root 
                value={slotForm.is_booked.toString()} 
                onValueChange={(value) => setSlotForm({...slotForm, is_booked: value === 'true'})}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="false">Available</Select.Item>
                  <Select.Item value="true">Booked</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>

            {slotForm.is_booked && (
              <>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">Patient Name</Text>
                  <TextField.Input
                    value={slotForm.patient_name}
                    onChange={(e) => setSlotForm({...slotForm, patient_name: e.target.value})}
                    placeholder="Enter patient name"
                  />
                </label>

                <label>
                  <Text as="div" size="2" mb="1" weight="bold">Patient Email</Text>
                  <TextField.Input
                    type="email"
                    value={slotForm.patient_email}
                    onChange={(e) => setSlotForm({...slotForm, patient_email: e.target.value})}
                    placeholder="Enter patient email"
                  />
                </label>
              </>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleCreateSlot}>
              {editingSlot ? 'Update' : 'Create'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default ScheduleManagement;