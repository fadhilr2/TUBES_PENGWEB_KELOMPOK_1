import { useState } from 'react';
import { EmptyState } from '../../components/UI';
import { formatDate, getAccountName, logDetails, newestFirst } from './adminHelpers';

export default function LogTab({ state }) {
  const [logSearch, setLogSearch] = useState('');

  function changeSearch(event) {
    setLogSearch(event.target.value);
  }

  const searchText = logSearch.toLowerCase();
  const matchingLogs = state.logs.filter(function matchLog(log) {
    const actorName = getAccountName(state.users, log.actorId);
    const haystack = `${log.action} ${logDetails(log)} ${actorName}`;
    return haystack.toLowerCase().includes(searchText);
  });
  const visibleLogs = newestFirst(matchingLogs);

  let content;
  if (visibleLogs.length > 0) {
    content = (
      <div className="table-scroll">
        <table className="data-table">
          <caption className="visually-hidden">Log aktivitas akun demo</caption>
          <thead>
            <tr>
              <th scope="col">Waktu</th>
              <th scope="col">Pelaku</th>
              <th scope="col">Aktivitas</th>
              <th scope="col">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map(function renderLog(log) {
              return (
                <tr key={log.id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{getAccountName(state.users, log.actorId)}</td>
                  <td>{log.action}</td>
                  <td>{logDetails(log)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    content = (
      <EmptyState
        title="Belum ada aktivitas yang cocok"
        description="Log baru muncul setelah akun, jasa, atau pesanan diperbarui."
      />
    );
  }

  return (
    <>
      <div className="field">
        <label htmlFor="log-search">Cari aktivitas</label>
        <input
          id="log-search"
          type="search"
          value={logSearch}
          onChange={changeSearch}
          placeholder="Aksi, keterangan, atau nama akun"
        />
      </div>
      {content}
    </>
  );
}
