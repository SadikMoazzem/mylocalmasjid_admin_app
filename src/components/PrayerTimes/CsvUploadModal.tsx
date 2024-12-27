import { Modal, Box, Text, Group, Button, FileInput, Table, Select, Stack, Alert } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconUpload, IconAlertCircle } from '@tabler/icons-react';
import Papa from 'papaparse';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMasjid } from '../../contexts/MasjidContext';

interface CsvUploadModalProps {
  opened: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'review';

const REQUIRED_FIELDS = [
  'date',
  'fajr_start',
  'fajr_jammat',
  'sunrise',
  'dhur_start',
  'dhur_jammat',
  'asr_start',
  'asr_jammat',
  'magrib_start',
  'magrib_jammat',
  'isha_start',
  'isha_jammat',
];

interface CsvData {
  headers: string[];
  rows: Record<string, string>[];
}

interface FieldMapping {
  [key: string]: string;
}

export function CsvUploadModal({ opened, onClose }: CsvUploadModalProps) {
  const { masjidId } = useMasjid();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (opened) {
      setCurrentStep('upload');
      setCsvData(null);
      setFieldMapping({});
      setError(null);
    }
  }, [opened]);

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        setCsvData({ headers, rows });

        // Check if headers match required fields
        const missingFields = REQUIRED_FIELDS.filter(
          field => !headers.includes(field)
        );

        if (missingFields.length === 0) {
          // All required fields are present, create direct mapping
          const mapping = headers.reduce((acc, header) => {
            if (REQUIRED_FIELDS.includes(header)) {
              acc[header] = header;
            }
            return acc;
          }, {} as FieldMapping);
          setFieldMapping(mapping);
          setCurrentStep('review');
        } else {
          // Some fields are missing, go to mapping step
          setCurrentStep('mapping');
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const response = await fetch(`/api/masjids/masjid/${masjidId}/prayer-times/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to upload prayer times');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-times', masjidId] });
      onClose();
    },
  });

  const handleUpload = () => {
    if (!csvData || !masjidId) return;

    const transformedData = csvData.rows.map(row => {
      const transformedRow: Record<string, any> = {
        masjid_id: masjidId,
        active: true,
      };

      Object.entries(fieldMapping).forEach(([required, csvHeader]) => {
        transformedRow[required] = row[csvHeader];
      });

      return transformedRow;
    });

    uploadMutation.mutate(transformedData);
  };

  const getDateRange = () => {
    if (!csvData) return null;

    const dates = csvData.rows
      .map(row => new Date(row[fieldMapping.date]))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return null;

    return {
      min: dates[0].toLocaleDateString(),
      max: dates[dates.length - 1].toLocaleDateString(),
    };
  };

  const renderStep = (): JSX.Element | null => {
    const dateRange = getDateRange();

    switch (currentStep) {
      case 'upload':
        return (
          <Stack>
            <FileInput
              label="Upload CSV file"
              placeholder="Click to select file"
              accept=".csv"
              onChange={handleFileUpload}
              leftSection={<IconUpload size={16} />}
            />
            {error && (
              <Alert color="red" icon={<IconAlertCircle />}>
                {error}
              </Alert>
            )}
          </Stack>
        );

      case 'mapping':
        return (
          <Stack>
            <Text>Map your CSV columns to the required fields:</Text>
            {REQUIRED_FIELDS.map(field => (
              <Select
                key={field}
                label={field}
                data={csvData?.headers || []}
                value={fieldMapping[field]}
                onChange={(value) => {
                  if (value) {
                    setFieldMapping(prev => ({ ...prev, [field]: value }));
                  }
                }}
              />
            ))}
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setCurrentStep('upload')}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep('review')}
                disabled={Object.keys(fieldMapping).length !== REQUIRED_FIELDS.length}
              >
                Continue
              </Button>
            </Group>
          </Stack>
        );

      case 'review':
        return (
          <Stack>
            <Text fw={500}>Review Upload</Text>
            {dateRange && (
              <Group>
                <Text>Date Range: {dateRange.min} - {dateRange.max}</Text>
              </Group>
            )}
            <Text>Total Records: {csvData?.rows.length}</Text>
            <Box style={{ maxHeight: '300px', overflow: 'auto' }}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    {REQUIRED_FIELDS.map(field => (
                      <Table.Th key={field}>{field}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {csvData?.rows.slice(0, 5).map((row, index) => (
                    <Table.Tr key={index}>
                      {REQUIRED_FIELDS.map(field => (
                        <Table.Td key={field}>
                          {row[fieldMapping[field]]}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setCurrentStep('mapping')}>
                Back
              </Button>
              <Button
                onClick={handleUpload}
                loading={uploadMutation.isPending}
              >
                Upload
              </Button>
            </Group>
          </Stack>
        );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload Prayer Times CSV"
      size="xl"
    >
      {renderStep()}
    </Modal>
  );
} 