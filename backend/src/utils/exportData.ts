import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';
import { Response } from 'express';
import { format } from 'date-fns';

interface ExportOptions {
  format: 'csv' | 'excel';
  filename: string;
  columns?: string[];
  groupBy?: string;
  includeMetrics?: boolean;
}

interface GroupMetrics {
  total: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
}

export async function exportShipments(data: any[], res: Response, options: ExportOptions) {
  const { format, filename, columns, groupBy, includeMetrics } = options;

  // Prepare data for export
  let exportData = data.map(shipment => {
    const baseData = {
      'Tracking Number': shipment.tracking_number,
      'Order ID': shipment.order_id,
      'Customer': `${shipment.first_name} ${shipment.last_name}`,
      'Email': shipment.customer_email,
      'Status': shipment.status,
      'Provider': shipment.provider_name,
      'Created At': format(new Date(shipment.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Estimated Delivery': shipment.estimated_delivery_date ? 
        format(new Date(shipment.estimated_delivery_date), 'yyyy-MM-dd HH:mm:ss') : '',
      'Actual Delivery': shipment.actual_delivery_date ? 
        format(new Date(shipment.actual_delivery_date), 'yyyy-MM-dd HH:mm:ss') : '',
      'Last Location': shipment.latest_event?.location || '',
      'Last Update': shipment.latest_event?.timestamp ? 
        format(new Date(shipment.latest_event.timestamp), 'yyyy-MM-dd HH:mm:ss') : '',
      'Weight (kg)': shipment.weight,
      'Shipping Cost': shipment.shipping_cost,
      'Priority': shipment.priority,
      'Is Delayed': shipment.is_delayed ? 'Yes' : 'No',
      'Has Issues': shipment.has_issues ? 'Yes' : 'No'
    };

    // Filter columns if specified
    if (columns) {
      return Object.fromEntries(
        Object.entries(baseData).filter(([key]) => columns.includes(key))
      );
    }

    return baseData;
  });

  // Group data if specified
  if (groupBy) {
    const grouped = new Map<string, any[]>();
    for (const item of exportData) {
      const key = item[groupBy];
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    if (includeMetrics) {
      exportData = Array.from(grouped.entries()).map(([key, items]) => {
        const metrics = calculateGroupMetrics(items);
        return {
          [groupBy]: key,
          'Total Shipments': metrics.total,
          'Delivered': metrics.delivered,
          'Delayed': metrics.delayed,
          'Avg Delivery Time (hours)': metrics.avgDeliveryTime,
          ...items[0] // Include first item's data for reference
        };
      });
    } else {
      exportData = Array.from(grouped.entries()).flatMap(([key, items]) => items);
    }
  }

  if (format === 'csv') {
    const csvContent = stringify(exportData, {
      header: true,
      columns: Object.keys(exportData[0])
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    return res.send(csvContent);
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shipments');

    // Add headers
    worksheet.columns = Object.keys(exportData[0]).map(header => ({
      header,
      key: header,
      width: 20
    }));

    // Add data
    worksheet.addRows(exportData);

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(
        column.width || 10,
        ...worksheet.getColumn(column.key as string).values
          .map(v => String(v).length)
      );
    });

    // Add metrics summary if included
    if (includeMetrics && !groupBy) {
      const metrics = calculateGroupMetrics(data);
      const summarySheet = workbook.addWorksheet('Summary');
      
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
      ];

      summarySheet.addRows([
        { metric: 'Total Shipments', value: metrics.total },
        { metric: 'Delivered Shipments', value: metrics.delivered },
        { metric: 'Delayed Shipments', value: metrics.delayed },
        { metric: 'Average Delivery Time (hours)', value: metrics.avgDeliveryTime }
      ]);

      summarySheet.getRow(1).font = { bold: true };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    
    return workbook.xlsx.write(res);
  }
}

function calculateGroupMetrics(items: any[]): GroupMetrics {
  return {
    total: items.length,
    delivered: items.filter(i => i.Status === 'delivered').length,
    delayed: items.filter(i => i['Is Delayed'] === 'Yes').length,
    avgDeliveryTime: Math.round(
      items.reduce((acc, i) => {
        if (i['Actual Delivery'] && i['Created At']) {
          const hours = (new Date(i['Actual Delivery']).getTime() - 
            new Date(i['Created At']).getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }
        return acc;
      }, 0) / items.filter(i => i['Actual Delivery']).length || 0
    )
  };
}

type ExportFormat = 'excel' | 'csv';

export async function exportOrders(data: any[], format: ExportFormat) {
  if (format === 'excel') {
    return exportToExcel(data);
  } else {
    return exportToCsv(data);
  }
}

async function exportToExcel(data: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');
  
  // Definiraj kolone
  worksheet.columns = [
    { header: 'Order ID', key: 'id' },
    { header: 'Customer', key: 'customerName' },
    { header: 'Status', key: 'status' },
    { header: 'Total', key: 'total' },
    // ... dodaj ostale kolone
  ];

  // Dodaj podatke
  worksheet.addRows(data);

  return workbook.xlsx.writeBuffer();
}

async function exportToCsv(data: any[]) {
  return new Promise((resolve, reject) => {
    stringify(data, {
      header: true,
      columns: {
        id: 'Order ID',
        customerName: 'Customer',
        status: 'Status',
        total: 'Total',
        // ... dodaj ostale kolone
      }
    }, (err, output) => {
      if (err) reject(err);
      else resolve(Buffer.from(output));
    });
  });
}

export async function exportData(data: any[], options: ExportOptions, res: Response) {
  const { format, filename } = options;

  if (format === 'csv') {
    const csvContent = await generateCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    return res.send(csvContent);
  } else {
    const workbook = await generateExcel(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    return workbook.xlsx.write(res);
  }
}

async function generateCsv(data: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(data, {
      header: true,
      columns: Object.keys(data[0])
    }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}

async function generateExcel(data: any[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  const columns = Object.keys(data[0]).map(key => ({
    header: key,
    key,
    width: 20
  }));

  worksheet.columns = columns;
  worksheet.addRows(data);

  return workbook;
} 