import { useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
// import { groupBy, range } from "lodash-es";
const groupBy = <T,>(array: T[], key: string): { [key: string]: T[] } => {
  return array.reduce((objectsByKeyValue: any, obj: any) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {} as { [key: string]: T[] });
};

const range = (start: number, end: number) => {
  return Array.from({ length: end - start }, (_, i) => i + start);
};

const escapeCsv = (str: string) => {
  return `"${str.replace(/"/g, "“")}"`;
};

const StyledApp = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 800px;
  height: 100%;
  z-index: 99999999;
`;
const StyledModal = styled.div`
  position: absolute;
  background-color: #d2d2d2;
  max-height: 100%;
  width: 100%;
  overflow-y: auto;
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
      : `https://appservices.contabilizei.com/plataforma/rest/notafiscal/consultar/list/${month}/${year}?cursor=0&limit=100`,
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

const guessDate = (result: Nota) => {
  let guess = /realizado dia (\d+\/\d+\/\d+)/g.exec(
    result.descricaoServico
  )?.[1];
  if (!guess) {
    guess = /prestado dia (\d+\/\d+\/\d+)/g.exec(result.descricaoServico)?.[1];
  }
  if (!guess) {
    guess = /os dias (\d+\/\d+\/\d+) a (\d+\/\d+\/\d+)/g.exec(
      result.descricaoServico
    )?.[1];
  }

  if (!guess) {
    guess = /(\d+\/\d+\/\d+)/g.exec(result.descricaoServico)?.[1];
  }
  if (!guess) {
    guess = result.competencia;
  }

  const [day, month, year] = guess.split("/");

  return guess
    ? dayjs(`${year.length === 2 ? `20${year}` : year}-${month}-${day}`)
    : null;
};
console.log("test 4");

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

              const allByMonth = await Promise.all(
                range(0, end.diff(start, "month") + 1).map(
                  async (monthOffset) => {
                    const date = start.add(monthOffset, "month");
                    const year = date.year();
                    const month = date.month() + 1;
                    return fetchNotes(month, year);
                  }
                )
              );

              let all: Nota[] = allByMonth.reduce((prev, { list }) => {
                return [...prev, ...list];
              }, [] as Nota[]);
              all = all.filter(
                ({ situacaoNota }) => situacaoNota.id === "PROCESSADO_SUCESSO"
              );
              setResults(all);
            }}
          >
            enviar
          </button>

          <button
            onClick={() => {
              let csv = results.map((nota) => {
                const date = guessDate(nota);
                return {
                  nome: nota.razaoSocialTomador,
                  valor: nota.valorServico.toString(),
                  link: nota.linkVisualizacao,
                  dataEmissao: nota.dataEmissao,
                  dataInferida: date?.format("DD/MM/YYYY"),
                  descricao: nota.descricaoServico,
                };
              });
              csv = [
                {
                  nome: "Nome",
                  valor: "Valor",
                  link: "Link da nota",
                  dataEmissao: "Data da emissão",
                  dataInferida: "Data inferida da sessao",
                  descricao: "Descrição",
                },
                ...csv,
              ];
              const csvContent =
                "data:text/csv;charset=utf-8," +
                csv
                  .map((e) =>
                    Object.values(e)
                      .map((v) => escapeCsv(v || ""))
                      .join(";")
                  )
                  .join("\n");
              var encodedUri = encodeURI(csvContent);
              var link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "my_data.csv");
              document.body.appendChild(link); // Required for FF

              link.click();
            }}
          >
            baixar csv
          </button>

          <div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Link da nota</th>
                  <th>Data da emissão</th>
                  <th>Data inferida da sessao</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {results.map((nota, i) => (
                  <tr key={i}>
                    <td>{nota.razaoSocialTomador}</td>
                    <td>{nota.valorServico}</td>
                    <td>{nota.linkVisualizacao}</td>
                    <td>{nota.dataEmissao}</td>
                    <td>{guessDate(nota)?.format("DD/MM/YYYY")}</td>
                    <td>{nota.descricaoServico}</td>
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
