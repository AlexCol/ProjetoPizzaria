export default class Semaphore {
  private tasks: Array<() => void> = [];
  private counter: number;

  constructor(private maxConcurrency: number) {
    this.counter = maxConcurrency;
  }

  async acquire(): Promise<void> {
    if (this.counter > 0) {
      this.counter--;
      return;
    }

    return new Promise(resolve => {
      this.tasks.push(() => {
        // ✅ NÃO decrementa aqui - o release() já vai decrementar
        resolve();
      });
    });
  }

  release(): void {
    if (this.tasks.length > 0) {
      // ✅ Se tem tarefas esperando, executa uma diretamente
      const next = this.tasks.shift();
      next?.();
    } else {
      // ✅ Se não tem tarefas esperando, incrementa o counter
      this.counter++;
    }
  }
}