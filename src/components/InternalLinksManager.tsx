import React, { useState, useRef } from "react";
import Select from "react-select";
import { useAppContext } from "../context/AppContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  onDragStart: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, onDragStart }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", `{${id}}`);
    onDragStart(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      draggable
      onDragStart={handleDragStart}
      className={`flex items-center gap-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-gray-900 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      {id}
    </div>
  );
};

const InternalLinksManager: React.FC = () => {
  const { csvData, currentTemplate, updateTemplate } = useAppContext();
  const [linkStructure, setLinkStructure] = useState("/{province}/{city}");
  const [anchorTextStructure, setAnchorTextStructure] = useState(
    "Idraulico a {city} ({linkCount} servizi)"
  );
  const [groupByVariable, setGroupByVariable] = useState<string | null>(null);
  const [maxLinks, setMaxLinks] = useState(5);
  const [variables, setVariables] = useState<string[]>([]);

  const linkInputRef = useRef<HTMLInputElement>(null);
  const anchorInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (csvData?.headers) {
      setVariables(csvData.headers);
    }
  }, [csvData?.headers]);

  React.useEffect(() => {
    if (currentTemplate?.template?.internalLinks) {
      const {
        linkFormat,
        titleFormat,
        groupBy,
        maxLinks: templateMaxLinks,
      } = currentTemplate.template.internalLinks;
      setLinkStructure(linkFormat || "/{province}/{city}");
      setAnchorTextStructure(
        titleFormat || "Idraulico a {city} ({linkCount} servizi)"
      );
      setGroupByVariable(groupBy || null);
      setMaxLinks(templateMaxLinks || 5);
    }
  }, [currentTemplate]);

  const handleSaveConfig = () => {
    if (!currentTemplate) return;

    const updatedTemplate = {
      ...currentTemplate,
      template: {
        ...currentTemplate.template,
        internalLinks: {
          enabled: true,
          maxLinks,
          linkFormat: linkStructure,
          titleFormat: anchorTextStructure,
          groupBy: groupByVariable || "Provincia",
        },
      },
    };

    updateTemplate(updatedTemplate);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVariables((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleInputDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-teal-500");
  };

  const handleInputDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-teal-500");
  };

  const handleInputDrop = (
    e: React.DragEvent,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-teal-500");

    const variable = e.dataTransfer.getData("text/plain");
    if (!inputRef.current) return;

    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;

    const newValue =
      value.substring(0, start) + variable + value.substring(end);

    if (input === linkInputRef.current) {
      setLinkStructure(newValue);
    } else if (input === anchorInputRef.current) {
      setAnchorTextStructure(newValue);
    }

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  if (!csvData?.headers) {
    return (
      <div className="text-gray-500 text-sm">
        Please upload a CSV file to configure internal links
      </div>
    );
  }

  const columnOptions = csvData.headers.map((header) => ({
    value: header,
    label: header,
  }));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link Structure
        </label>
        <div className="space-y-2">
          <input
            ref={linkInputRef}
            type="text"
            value={linkStructure}
            onChange={(e) => setLinkStructure(e.target.value)}
            onDragOver={handleInputDragOver}
            onDragLeave={handleInputDragLeave}
            onDrop={(e) => handleInputDrop(e, linkInputRef)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all"
            placeholder="/{province}/{city}"
          />
          <p className="text-xs text-gray-500">
            Drag variables or use {"{variable}"} syntax to insert CSV column
            values in the URL structure
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Anchor Text Structure
        </label>
        <div className="space-y-2">
          <input
            ref={anchorInputRef}
            type="text"
            value={anchorTextStructure}
            onChange={(e) => setAnchorTextStructure(e.target.value)}
            onDragOver={handleInputDragOver}
            onDragLeave={handleInputDragLeave}
            onDrop={(e) => handleInputDrop(e, anchorInputRef)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all"
            placeholder="Idraulico a {city} ({linkCount} servizi)"
          />
          <p className="text-xs text-gray-500">
            Use {"{linkCount}"} to show the number of services in the category
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Links per Page
        </label>
        <div className="space-y-2">
          <input
            type="number"
            value={maxLinks}
            onChange={(e) => setMaxLinks(parseInt(e.target.value) || 5)}
            min={1}
            max={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
          <p className="text-xs text-gray-500">
            Maximum number of internal links to show on each page
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Group Links By Variable
        </label>
        <div className="space-y-2">
          <Select
            value={columnOptions.find((opt) => opt.value === groupByVariable)}
            onChange={(option) => setGroupByVariable(option?.value || null)}
            options={columnOptions}
            isClearable
            className="text-sm"
            placeholder="Select a variable to group links"
          />
          <p className="text-xs text-gray-500">
            Links will be grouped based on matching values in this column
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Available Variables
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          Drag variables to reorder or into the input fields above
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={variables}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <SortableItem
                  key={variable}
                  id={variable}
                  onDragStart={() => {}}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default InternalLinksManager;
