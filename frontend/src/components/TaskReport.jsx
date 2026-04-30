import React from 'react';
import { Download, FileText, FileDown } from 'lucide-react';

// Format date to dd-mm-yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const TaskReport = ({ tasks, user }) => {
  if (!tasks || tasks.length === 0) return null;

  const userDisplay = user?.email || user?.name || 'Unknown User';

  // --- CSV Download ---
  const downloadCSV = () => {
    const headers = ['TaskID', 'Task Name', 'Status', 'Priority', 'Enroll Date', 'Complete Date'];
    const rows = tasks.map(task => [
      task._id || '—',
      `"${(task.title || '').replace(/"/g, '""')}"`,
      task.status || '—',
      task.priority || '—',
      formatDate(task.createdAt),
      task.status === 'completed' ? formatDate(task.updatedAt) : '—',
    ]);
    const userLine = `User: ${userDisplay}\n`;
    const csvContent = userLine + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `task_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- PDF Download via browser print ---
  const downloadPDF = () => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const rows = tasks.map((task, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-family:monospace;font-size:10px" title="${task._id}">...${String(task._id || '').slice(-6)}</td>
        <td><strong>${task.title || '—'}</strong></td>
        <td>
          <span style="
            padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;
            background:${task.status === 'completed' ? '#d1fae5' : '#fef3c7'};
            color:${task.status === 'completed' ? '#065f46' : '#92400e'}
          ">
            ${task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
          </span>
        </td>
        <td>
          <span style="
            padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;
            background:${task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#d1fae5'};
            color:${task.priority === 'high' ? '#991b1b' : task.priority === 'medium' ? '#92400e' : '#065f46'}
          ">
            ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '—'}
          </span>
        </td>
        <td>${formatDate(task.createdAt)}</td>
        <td>${task.status === 'completed' ? formatDate(task.updatedAt) : '—'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Task Report</title>
        <style>
          @page { size: A4 landscape; margin: 18mm 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; }

          .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
          .header h1 { font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px; }
          .header h1 span { color: #1e293b; }
          .header .meta { font-size: 11px; color: #64748b; text-align: right; line-height: 1.8; }
          .meta strong { color: #1e293b; }

          .user-info { font-size: 12px; color: #475569; margin-bottom: 14px; }
          .user-info strong { color: #7c3aed; }

          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #7c3aed; color: white; }
          thead th { padding: 9px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
          tbody tr { border-bottom: 1px solid #e2e8f0; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          tbody tr:last-child { border-bottom: none; }
          tbody td { padding: 8px 10px; vertical-align: middle; }

          .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Smart<span>Do</span> — Task Report</h1>
          <div class="meta">
            <div>Generated: <strong>${today}</strong></div>
            <div>Total Tasks: <strong>${tasks.length}</strong></div>
          </div>
        </div>

        <div class="user-info">User: <strong>${userDisplay}</strong></div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Task ID</th>
              <th>Task Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Enroll Date</th>
              <th>Complete Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">
          SmartDo Smart To-Do List Management App &bull; ${userDisplay} &bull; ${today}
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1100,height=700');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="mt-8 animate-fade-in">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-purple-600" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Task Report</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all duration-150"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all duration-150"
          >
            <FileDown size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* User info shown once above the table */}
      <p className="text-sm text-slate-500 mb-3">
        User: <span className="font-semibold text-slate-800">{userDisplay}</span>
      </p>

      {/* On-screen Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-purple-600">
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">#</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Task ID</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Task Name</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Priority</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Enroll Date</th>
              <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Complete Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task, index) => (
              <tr key={task._id} className={`transition-colors hover:bg-slate-50 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs" title={task._id}>
                  ...{String(task._id || '').slice(-6)}
                </td>
                <td className="px-4 py-3 text-slate-800 font-semibold max-w-[200px]">
                  <span className="line-clamp-1" title={task.title}>{task.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    task.priority === 'high'   ? 'bg-red-50 text-red-600' :
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(task.createdAt)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {task.status === 'completed'
                    ? formatDate(task.updatedAt)
                    : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskReport;
