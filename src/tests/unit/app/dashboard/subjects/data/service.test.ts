import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/app/dashboard/subjects/data/service";

import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("subjects service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch subjects", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, name: "Algoritmos", workload: 60 }],
    });

    const result = await fetchSubjects();

    expect(mockedApi.get).toHaveBeenCalledWith("/subjects");
    expect(result).toEqual([{ id: 1, name: "Algoritmos", workload: 60 }]);
  });

  it("should create subject", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createSubject({
      name: "Estrutura de Dados",
      workload: 80,
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/subjects", {
      name: "Estrutura de Dados",
      workload: 80,
    });
  });

  it("should update subject", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateSubject({
      id: 10,
      name: "Banco de Dados",
      workload: 60,
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/subjects/10", {
      name: "Banco de Dados",
      workload: 60,
    });
  });

  it("should delete subject", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteSubject(5);

    expect(mockedApi.delete).toHaveBeenCalledWith("/subjects/5");
  });
});
