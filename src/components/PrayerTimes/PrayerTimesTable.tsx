import { Table, ScrollArea, Text, Box, Center, Stack, Button } from '@mantine/core';
import { IconEdit, IconCalendarX } from '@tabler/icons-react';
import { PrayerTime } from '../../services/api';
import { formatTime, formatHijriDate, isToday } from '../../utils/prayerTimeUtils';
import { useRef, useEffect } from 'react';

interface PrayerTimesTableProps {
  daysInMonth: string[];
  prayerTimesByDate: Map<string, PrayerTime>;
  use24Hour: boolean;
  onEdit: (date: string, time: PrayerTime) => void;
}

export function PrayerTimesTable({ 
  daysInMonth, 
  prayerTimesByDate, 
  use24Hour, 
  onEdit 
}: PrayerTimesTableProps) {
  const todayRowRef = useRef<HTMLTableRowElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Scroll to today's row when data changes
  useEffect(() => {
    if (todayRowRef.current && scrollViewportRef.current) {
      const viewport = scrollViewportRef.current.querySelector('.mantine-ScrollArea-viewport') as HTMLDivElement;
      if (!viewport) return;

      const headerHeight = viewport.querySelector('thead')?.getBoundingClientRect().height || 0;
      const rowTop = todayRowRef.current.offsetTop;
      
      viewport.scrollTo({
        top: Math.max(0, rowTop - headerHeight),
        behavior: 'smooth'
      });
    }
  }, [daysInMonth]);

  // Show no data message if there are no prayer times
  if (prayerTimesByDate.size === 0) {
    return (
      <Center h="calc(100vh - 200px)">
        <Stack align="center" gap="md">
          <IconCalendarX size={48} color="var(--mantine-color-gray-5)" />
          <Text size="xl" fw={500} c="dimmed">No Prayer Times Available</Text>
          <Text c="dimmed" ta="center">
            There are no prayer times available for this month.<br />
            Please upload prayer times using the CSV upload feature.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Table.ScrollContainer minWidth={800} ref={scrollViewportRef}>
        <Table striped highlightOnHover stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Date</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Hijri (est)</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Fajr</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Sunrise</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Zuhr</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Asr</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Maghrib</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Isha</Table.Th>
              <Table.Th style={{ backgroundColor: 'var(--mantine-color-body)' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {daysInMonth.map((date) => {
              console.log(date);
              const prayerTime = prayerTimesByDate.get(date);
              const rowRef = isToday(date) ? todayRowRef : undefined;

              return (
                <Table.Tr 
                  key={date} 
                  ref={rowRef}
                  bg={isToday(date) ? 'var(--mantine-color-blue-light)' : undefined}
                >
                  <Table.Td>
                    <Text size="sm">{new Date(date).toLocaleDateString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{prayerTime ? formatHijriDate(prayerTime.hijri_date) : '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatTime(prayerTime?.fajr_jammat, use24Hour)}
                      <br />
                      <Text span c="dimmed" size="xs">
                        {formatTime(prayerTime?.fajr_start, use24Hour)}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatTime(prayerTime?.sunrise, use24Hour)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatTime(prayerTime?.dhur_jammat, use24Hour)}
                      <br />
                      <Text span c="dimmed" size="xs">
                        {formatTime(prayerTime?.dhur_start, use24Hour)}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatTime(prayerTime?.asr_jammat, use24Hour)}
                      {prayerTime?.asr_start_1 && (
                        <>
                          <br />
                          <Text span c="dimmed" size="xs">
                            {formatTime(prayerTime.asr_start_1, use24Hour)} (H)
                          </Text>
                        </>
                      )}
                      <br />
                      <Text span c="dimmed" size="xs">
                        {formatTime(prayerTime?.asr_start, use24Hour)}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatTime(prayerTime?.magrib_jammat, use24Hour)}
                      <br />
                      <Text span c="dimmed" size="xs">
                        {formatTime(prayerTime?.magrib_start, use24Hour)}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatTime(prayerTime?.isha_jammat, use24Hour)}
                      <br />
                      <Text span c="dimmed" size="xs">
                        {formatTime(prayerTime?.isha_start, use24Hour)}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {prayerTime && (
                      <IconEdit
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEdit(date, prayerTime)}
                      />
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Box>
  );
} 