type CheckBoxGroupProps = {
  itens: Map<string, string>; // Assuming itens is a map of permission names to their display names
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  currentList: string[]
}

function CheckBoxGroup({ itens, handleChange, isLoading, currentList }: CheckBoxGroupProps) {
  return (
    <div className={checkboxGroupTailwindClass}>
      {Array.from(itens.entries()).map(([value, label]) => (
        <label key={value} className="flex items-center gap-2 cursor-pointer">
          <input
            className="cursor-pointer"
            type="checkbox"
            value={value}
            checked={currentList.includes(value)}
            onChange={handleChange}
            disabled={isLoading}
          />
          {label}
        </label>
      ))}
    </div>
  )
}

export default CheckBoxGroup

const checkboxGroupTailwindClass = `
  flex
  flex-row
  gap-6
  w-full
  justify-center
  items-center
  mt-2
  accent-dark-green-900-pizzaria
`;