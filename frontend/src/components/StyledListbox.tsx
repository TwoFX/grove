import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { JSX } from "react";
import { BsCheck, BsChevronDown } from "react-icons/bs";

export interface StyledListboxOption {
  key: string;
  displayShort: string;
}

export function StyledListbox({
  title,
  options,
  selectedOptions,
  setSelectedOptions,
  displayMode = "list",
  multiple = true,
}: {
  title: string;
  options: StyledListboxOption[];
  selectedOptions: string[];
  setSelectedOptions: (selectedOptions: string[]) => void;
  displayMode?: "title" | "list";
  multiple?: boolean;
}): JSX.Element {
  const selectedCount = selectedOptions.length;

  let displayText: string;
  if (displayMode === "title") {
    displayText = `${selectedCount} ${title}${selectedCount === 1 ? "" : "s"}`;
  } else {
    // "list" mode
    if (selectedCount === 0) {
      displayText = multiple ? `Select ${title}s` : `Select ${title}`;
    } else {
      const selectedDisplayValues = selectedOptions
        .map(
          (key) => options.find((opt) => opt.key === key)?.displayShort || key,
        )
        .join(", ");
      displayText = selectedDisplayValues;
    }
  }

  // Handle the conversion between array interface and single-value mode
  const listboxValue = multiple ? selectedOptions : (selectedOptions[0] ?? "");
  const listboxOnChange = multiple
    ? setSelectedOptions
    : (value: string) => setSelectedOptions([value]);

  return (
    <div className="relative min-w-[300px]">
      <Listbox value={listboxValue} onChange={listboxOnChange} multiple={multiple}>
        <ListboxButton className="relative w-full cursor-pointer rounded border border-border bg-surface pl-3 pr-8 text-left focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-focus-ring">
          <span className="block truncate text-text-primary">
            {displayText}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <BsChevronDown className="h-4 w-4 text-text-disabled" />
          </span>
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-border bg-surface py-1 shadow-lg focus:outline-none">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-text-tertiary text-sm">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <ListboxOption
                key={option.key}
                value={option.key}
                className="relative cursor-pointer select-none py-2 pl-8 pr-3 hover:bg-surface-hover data-[focus]:bg-surface-active"
              >
                {({ selected }) => (
                  <>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <BsCheck className="h-4 w-4 text-text-primary font-bold" />
                      </span>
                    )}
                    <span
                      className={`block truncate ${selected ? "font-bold" : "font-normal"}`}
                    >
                      {option.displayShort}
                    </span>
                  </>
                )}
              </ListboxOption>
            ))
          )}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
