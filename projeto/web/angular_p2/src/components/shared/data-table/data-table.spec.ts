import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table';
import { DataTableColumnDef, DataTableQuery } from './data-table.types';

interface TestRow {
  id: number;
  name: string;
}

const columns: DataTableColumnDef<TestRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    meta: {
      filter: {
        type: 'text',
      },
    },
  },
];

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent<TestRow>);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', [
      { id: 1, name: 'Ana' },
      { id: 2, name: 'Bruno' },
      { id: 3, name: 'Carla' },
    ]);
    fixture.componentRef.setInput('pageSize', 2);
    fixture.detectChanges();
  });

  it('pagina os dados localmente', () => {
    expect(fixture.nativeElement.textContent).toContain('Ana');
    expect(fixture.nativeElement.textContent).toContain('Bruno');
    expect(fixture.nativeElement.textContent).not.toContain('Carla');

    const nextButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Próxima',
    );
    nextButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carla');
    expect(fixture.nativeElement.textContent).not.toContain('Ana');
  });

  it('emite a consulta sem paginar novamente no modo remoto', () => {
    let emittedQuery: DataTableQuery | undefined;
    fixture.componentRef.setInput('mode', 'server');
    fixture.componentRef.setInput('totalItems', 30);
    fixture.componentInstance.queryChange.subscribe((query) => (emittedQuery = query));
    fixture.detectChanges();

    const sortButton = fixture.nativeElement.querySelector('thead button') as HTMLButtonElement;
    sortButton.click();
    fixture.detectChanges();

    expect(emittedQuery).toEqual({
      page: 1,
      pageSize: 2,
      filters: [],
      sorting: {
        field: 'name',
        direction: 'asc',
      },
    });
    expect(fixture.nativeElement.textContent).toContain('Carla');
  });
});
