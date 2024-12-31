import { Container, Group, Button, LoadingOverlay, Switch, Select } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { masjidApi, PrayerTime } from '../services/api';
import { IconChevronLeft, IconChevronRight, IconClock, IconPrinter, Icon24Hours, IconUpload } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { getMonthDates, getDaysInMonth } from '../utils/prayerTimeUtils';
import { EditPrayerTimeModal } from '../components/PrayerTimes/EditPrayerTimeModal';
import { CsvUploadModal } from '../components/PrayerTimes/CsvUploadModal';
import { PrayerTimesTable } from '../components/PrayerTimes/PrayerTimesTable';
import { useMasjid } from '../contexts/MasjidContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthYear(date: Date) {
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

interface MonthOption {
  value: string;
  label: string;
}

function getMonthOptions(currentDate: Date): MonthOption[] {
  const options = new Set<MonthOption>();
  const date = new Date(currentDate);
  date.setMonth(date.getMonth() - 1); // Previous month

  for (let i = 0; i < 14; i++) { // Previous month + current month + 12 months
    const value = `${date.getMonth()}-${date.getFullYear()}`;
    options.add({
      value,
      label: getMonthYear(date)
    });
    date.setMonth(date.getMonth() + 1);
  }

  return Array.from(options);
}

function PrayerTimes() {
  const { masjidId } = useMasjid();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(true);
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPrayerTime, setSelectedPrayerTime] = useState<PrayerTime | undefined>();
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);

  const monthOptions = useMemo(() => getMonthOptions(currentMonth), [currentMonth]);

  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ['prayer-times', masjidId, currentMonth],
    queryFn: async () => {
      if (!masjidId) return null;
      const { start, end } = getMonthDates(currentMonth);
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      
      return masjidApi.getPrayerTimes(masjidId, start, end, daysInMonth);
    },
    enabled: !!masjidId,
  });

  // Create a map of dates to prayer times for easier lookup
  const prayerTimesByDate = new Map<string, PrayerTime>(
    prayerTimes?.map((time: PrayerTime) => [time.date, time])
  );

  // Get all days in the month
  const daysInMonth = getDaysInMonth(currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() - 1);
      return date;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() + 1);
      return date;
    });
  };

  const handleMonthChange = (value: string | null) => {
    if (!value) return;
    const [month, year] = value.split('-').map(Number);
    setCurrentMonth(prev => {
      const date = new Date(prev);
      date.setFullYear(year);
      date.setMonth(month);
      return date;
    });
  };

  const handleEdit = (date: string, time: PrayerTime) => {
    setSelectedDate(date);
    setSelectedPrayerTime(time);
    openModal();
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container fluid h="100%" p={0} style={{ overflow: 'hidden' }}>
      <Group justify="space-between" p="md">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={16} />}
            onClick={handlePreviousMonth}
          >
            Previous
          </Button>
          <Select
            value={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
            onChange={handleMonthChange}
            data={monthOptions}
            w={180}
          />
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={16} />}
            onClick={handleNextMonth}
          >
            Next
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconClock size={16} />}
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </Group>
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconUpload size={16} />}
            onClick={openUploadModal}
          >
            Upload CSV
          </Button>
          <Switch
            label="24-hour"
            checked={use24Hour}
            onChange={(event) => setUse24Hour(event.currentTarget.checked)}
            thumbIcon={use24Hour ? <Icon24Hours size={12} /> : <IconClock size={12} />}
          />
          <Button
            variant="subtle"
            leftSection={<IconPrinter size={16} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Group>
      </Group>

      <PrayerTimesTable
        daysInMonth={daysInMonth}
        prayerTimesByDate={prayerTimesByDate}
        use24Hour={use24Hour}
        onEdit={handleEdit}
      />

      <EditPrayerTimeModal
        opened={opened}
        onClose={closeModal}
        selectedDate={selectedDate}
        initialValues={selectedPrayerTime}
      />

      <CsvUploadModal
        opened={uploadModalOpened}
        onClose={closeUploadModal}
      />
    </Container>
  );
}

export default PrayerTimes; 