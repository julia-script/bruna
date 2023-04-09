import { useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { groupBy, range } from "lodash-es";
const StyledApp = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 800px;
  height: 100%;
  pointer-events: none;
  z-index: 99999999;

  & > * {
    pointer-events: auto;
  }
`;
const StyledModal = styled.div`
  position: absolute;
  background-color: #d2d2d2;
  max-height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  font-family: sans-serif;
  padding: 15px;
  margin: 15px;
  border-radius: 5px;
`;

const StyledToggleButton = styled.button`
  position: absolute;
  background-color: #d2d2d2;
  height: 50px;

  top: 0;
  right: 0;
  font-family: sans-serif;
  padding: 15px;
  margin: 15px;
  border-radius: 5px;
`;

export interface Nota {
  id: number;
  idEmissor: number;
  numero?: null;
  codVerificacao?: null;
  numeroRps: string;
  serieRps: string;
  razaoSocialTomador: string;
  valorServico: number;
  cnpjTomador: string;
  descricaoServico: string;
  dataEmissao: string;
  dataImportacao?: null;
  erroProcessamento?: null;
  motivoCancelamento?: null;
  situacaoNota: SituacaoNotaOrSituacaoCnae;
  situacaoNFe?: null;
  tipoNota: string;
  situacaoCnae: SituacaoNotaOrSituacaoCnae;
  situacaoRetencaoNota?: null;
  permiteMovimentacao: boolean;
  importada: boolean;
  registrada: boolean;
  anexoEscolhido: number;
  numeroNotaSubstituta?: null;
  logAlteracoes?: null;
  nomeArquivo?: null;
  idLoteNotaFiscal?: null;
  competencia: string;
  linkVisualizacao: string;
  errosNotaFiscal?: ErrosNotaFiscalEntity[] | null;
}
export interface SituacaoNotaOrSituacaoCnae {
  id: string;
  descricao: string;
}
export interface ErrosNotaFiscalEntity {
  codigo: string;
  descricao: string;
}

const fetchNotes = async (month: number, year: number) => {
  if (import.meta.env.DEV) {
  }
  const token = localStorage.getItem("ctbz-token");
  const response = await fetch(
    import.meta.env.DEV
      ? "/samples/notas.json"
      : `https://appservices.contabilizei.com/plataforma/rest/notafiscal/consultar/list/${month}/${year}?cursor=0&limit=20`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "strinfs-token": token,
      } as any,
    }
  );
  const data = await response.json();
  return data;
};
function App() {
  const [open, setOpen] = useState(true);
  const date = new Date();
  const [startMonth, setStartMonth] = useState(date.getMonth());
  const [startYear, setStartYear] = useState(date.getFullYear());
  const [endMonth, setEndMonth] = useState(date.getMonth());
  const [endYear, setEndYear] = useState(date.getFullYear());

  const [results, setResults] = useState<Nota[]>([]);
  const byPerson = groupBy(results, "razaoSocialTomador");
  return (
    <StyledApp id="bruna">
      {open ? (
        <StyledModal>
          <button onClick={() => setOpen(false)}>Fechar</button>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => i).map((yearOffset) => {
              const year = date.getFullYear() - yearOffset;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          <select
            value={endMonth}
            onChange={(e) => setEndMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => i).map((yearOffset) => {
              const year = date.getFullYear() - yearOffset;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          <button
            onClick={async () => {
              // https://appservices.contabilizei.com/plataforma/rest/notafiscal/consultar/list/4/2023?cursor=0&limit=20
              const start = dayjs(`${startYear}-${startMonth + 1}-01`);
              const end = dayjs(`${endYear}-${endMonth + 1}-01`);

              let all = await Promise.all(
                range(0, end.diff(start, "month") + 1).map(
                  async (monthOffset) => {
                    const date = start.add(monthOffset, "month");
                    const year = date.year();
                    const month = date.month() + 1;
                    return fetchNotes(month, year);
                  }
                )
              );

              all = all.reduce((prev, { list }) => {
                return [...prev, ...list];
              }, [] as Nota[]);
              setResults(all);
            }}
          >
            enviar
          </button>

          <div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor total</th>
                  <th>Links das notas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byPerson).map(([name, notes]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>
                      {notes.reduce((prev, { valorServico }) => {
                        return prev + valorServico;
                      }, 0)}
                    </td>
                    <td>
                      {notes.map(({ linkVisualizacao }) => (
                        <a href={linkVisualizacao} target="_blank">
                          {linkVisualizacao}
                        </a>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StyledModal>
      ) : (
        <StyledToggleButton onClick={() => setOpen(true)}>
          Menu da bruna
        </StyledToggleButton>
      )}
    </StyledApp>
  );
}

export default App;
