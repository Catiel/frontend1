import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Link,
  MoreVertical,
  Paperclip,
  Trash,
  User,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import TaskEditDialog from "./TaskEditDialog";

const getTaskBorderColor = (status) => {
  switch (status) {
    case "todo":
      return "border-yellow-400";
    case "in_progress":
      return "border-blue-500";
    case "done":
      return "border-green-500";
    default:
      return "border-gray-300";
  }
};

export default function KanbanBoard({
  sprint,
  columns: initialColumns,
  onDragEnd,
  teamMembers,
  onDeleteTask,
  onEditTask,
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const getAssigneeNames = useCallback(
    (assignedTo) => {
      return assignedTo.map((user) => {
        const assignee = teamMembers.find((member) => member.id === user.id);
        return assignee
          ? `${assignee.name} ${assignee.last_name}`
          : "No asignado";
      });
    },
    [teamMembers],
  );

  const handleEditClick = useCallback((task) => {
    if (task.status === "done" && task.reviewed) return;
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  }, []);

  const toggleTaskExpansion = useCallback((taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }, []);

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      setColumns((prevColumns) => {
        const updatedColumns = prevColumns.map((column) => ({
          ...column,
          tasks: [...column.tasks],
        }));

        const sourceColumn = updatedColumns.find(
          (col) => col.id === source.droppableId,
        );
        const destColumn = updatedColumns.find(
          (col) => col.id === destination.droppableId,
        );

        const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
        movedTask.status = destColumn.id;
        destColumn.tasks.splice(destination.index, 0, movedTask);

        onDragEnd(result);
        return updatedColumns;
      });
    },
    [onDragEnd],
  );

  const renderResources = useCallback((resources) => {
    if (!resources || resources.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {resources.map((resource, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:text-purple-900 flex items-center bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-full transition-all duration-200"
                >
                  {resource.type === "file" ? (
                    <Paperclip className="h-3 w-3 mr-1" />
                  ) : (
                    <Link className="h-3 w-3 mr-1" />
                  )}
                  <span className="truncate max-w-[100px]">
                    {resource.name}
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {resource.type === "file"
                    ? "Archivo adjunto"
                    : "Enlace externo"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }, []);

  return (
    <>
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-900 pb-3 border-b border-purple-200">
        Sprint: {sprint.title}
      </h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden max-h-[calc(100vh-200px)] flex flex-col"
            >
              <h4 className="font-semibold text-lg text-white bg-gradient-to-r from-purple-600 to-purple-800 p-3 flex justify-between items-center">
                {column.title}
                <Badge
                  variant="outline"
                  className="bg-white text-purple-800 border-purple-300"
                >
                  {column.tasks.length}
                </Badge>
              </h4>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-3 min-h-[200px] space-y-3 flex-grow overflow-y-auto ${snapshot.isDraggingOver ? "bg-purple-50" : ""}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                        isDragDisabled={task.status === "done" && task.reviewed}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${getTaskBorderColor(task.status)} border-l-4 ${snapshot.isDragging ? "shadow-lg" : ""} ${task.status === "done" && task.reviewed ? "opacity-75" : ""} mb-3 w-full`}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-base sm:text-lg text-purple-800 break-words w-5/6">
                                  {task.title}
                                </span>
                                {task.status === "done" && task.reviewed ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Tarea completada y revisada</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="text-purple-600 hover:text-purple-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-full p-1">
                                        <MoreVertical className="h-5 w-5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1 bg-white shadow-lg border border-purple-100 rounded-lg">
                                      <div className="flex space-x-1">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200"
                                                onClick={() =>
                                                  handleEditClick(task)
                                                }
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Editar tarea</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                onClick={() =>
                                                  onDeleteTask(task.id)
                                                }
                                                disabled={
                                                  task.status === "done" &&
                                                  task.reviewed
                                                }
                                              >
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Eliminar tarea</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 mb-2 break-words">
                                {expandedTasks[task.id]
                                  ? task.description
                                  : task.description.slice(0, 100) +
                                    (task.description.length > 100
                                      ? "..."
                                      : "")}
                              </div>
                              {task.description.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskExpansion(task.id)}
                                  className="text-purple-600 hover:text-purple-800 p-0 h-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded text-xs"
                                >
                                  {expandedTasks[task.id] ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Menos
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      Más
                                    </>
                                  )}
                                </Button>
                              )}
                              {renderResources(task.resources)}
                            </CardContent>
                            <CardFooter className="px-3 py-2">
                              <div className="text-xs text-gray-600 w-full">
                                <div className="flex items-center mb-1">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="font-medium">
                                    Asignados:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {getAssigneeNames(task.assigned_to).map(
                                    (name, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800 px-2 py-1"
                                      >
                                        {name}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={selectedTask}
        onEditTask={onEditTask}
        teamMembers={teamMembers}
      />
    </>
  );
}
