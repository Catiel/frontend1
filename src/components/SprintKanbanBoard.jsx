import React, { useEffect, useState } from "react";
import { deleteData, getData, postData, putData } from "../api/apiService";
import { AlertCircle, Loader2 } from "lucide-react";
import SprintHeader from "./SprintHeader";
import KanbanBoard from "./KanbanBoard";
import NewTaskDialog from "./NewTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialColumns = [
  { id: "todo", title: "Por Hacer", tasks: [] },
  { id: "in_progress", title: "En Progreso", tasks: [] },
  { id: "done", title: "Hecho", tasks: [] },
];

export default function SprintKanbanBoard({ groupId }) {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState({});
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [sprintsData, groupDetailsResponse] = await Promise.all([
          getData(`/sprints?group_id=${groupId}`),
          getData(`/groups/details?group_id=${groupId}`),
        ]);

        setSprints(sprintsData);

        if (
          groupDetailsResponse.success &&
          groupDetailsResponse.data &&
          groupDetailsResponse.data.group
        ) {
          setGroupDetails(groupDetailsResponse.data.group);
          const members = [
            groupDetailsResponse.data.group.representative,
            ...Object.values(groupDetailsResponse.data.group.members || {}),
          ].filter(Boolean);
          setTeamMembers(members);
        }

        if (sprintsData.length > 0) {
          setCurrentSprint(sprintsData[0]);
          await fetchTasks(sprintsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description:
            "No se pudo cargar la información inicial. Por favor, intente de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [groupId]);

  const fetchTasks = async (sprintId) => {
    try {
      const response = await getData(`/tasks?sprint_id=${sprintId}`);
      if (response.success && response.data && response.data.items) {
        const tasks = response.data.items;
        const updatedColumns = initialColumns.map((col) => ({
          ...col,
          tasks: tasks.filter((task) => task.status === col.id),
        }));
        setColumns(updatedColumns);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar las tareas. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );

    if (sourceColumn && destColumn) {
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removedTask] = sourceTasks.splice(source.index, 1);

      destTasks.splice(destination.index, 0, removedTask);

      const updatedColumns = columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceTasks };
        } else if (col.id === destination.droppableId) {
          return { ...col, tasks: destTasks };
        } else {
          return col;
        }
      });

      setColumns(updatedColumns);

      try {
        await putData(`/tasks/${removedTask.id}`, {
          title: removedTask.title,
          description: removedTask.description,
          assigned_to: removedTask.assigned_to.map((user) => user.id),
          status: destColumn.id,
        });
      } catch (error) {
        console.error("Error updating task:", error);
        toast({
          title: "Error",
          description:
            "No se pudo actualizar la tarea. Por favor, intente de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const addNewTask = async () => {
    if (
      !newTask.title ||
      !newTask.description ||
      !newTask.assigned_to ||
      newTask.assigned_to.length === 0
    ) {
      toast({
        title: "Error",
        description:
          "Por favor, complete todos los campos de la tarea y asigne al menos un miembro.",
        variant: "destructive",
      });
      return;
    }

    const newTaskObj = {
      sprint_id: currentSprint.id,
      title: newTask.title,
      description: newTask.description,
      assigned_to: newTask.assigned_to.map((user) => user.id),
      status: "todo",
      links: newTask.links,
    };

    try {
      const response = await postData("/tasks", newTaskObj);
      if (response.success && response.data && response.data.item) {
        const createdTask = response.data.item;
        const newColumns = columns.map((col) => {
          if (col.id === "todo") {
            return { ...col, tasks: [...col.tasks, createdTask] };
          }
          return col;
        });

        setColumns(newColumns);
        setNewTask({});
        setIsTaskDialogOpen(false);
        toast({
          title: "Tarea creada",
          description: "La nueva tarea se ha añadido exitosamente.",
          className: "bg-green-500 text-white",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleSprintChange = async (sprintId) => {
    setIsLoading(true);
    const selectedSprint = sprints.find(
      (sprint) => sprint.id === parseInt(sprintId),
    );
    if (selectedSprint) {
      setCurrentSprint(selectedSprint);
      await fetchTasks(sprintId);
    }
    setIsLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteData(`/tasks/${taskId}`);
      const updatedColumns = columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      }));
      setColumns(updatedColumns);
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente.",
        variant: "success",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (taskId, updatedTask) => {
    try {
      const response = await putData(`/tasks/${taskId}`, {
        ...updatedTask,
        assigned_to: updatedTask.assigned_to.map((user) => user.id),
        links: updatedTask.links,
      });

      if (response.success && response.data && response.data.item) {
        const editedTask = response.data.item;
        const updatedColumns = columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? editedTask : task,
          ),
        }));
        setColumns(updatedColumns);
        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha actualizado exitosamente.",
          className: "bg-green-500 text-white",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error editing task:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <span className="text-xl text-purple-800 font-semibold">
            Cargando tablero...
          </span>
          <p className="text-gray-600 text-center">
            Estamos preparando tu espacio de trabajo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg shadow-lg overflow-hidden mt-6">
      <SprintHeader
        sprints={sprints}
        currentSprint={currentSprint}
        onSprintChange={handleSprintChange}
        onNewTaskClick={() => setIsTaskDialogOpen(true)}
      />
      <div className="p-4 sm:p-6">
        {currentSprint ? (
          <KanbanBoard
            sprint={currentSprint}
            columns={columns}
            onDragEnd={onDragEnd}
            teamMembers={teamMembers}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay sprint disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Para comenzar a gestionar tus tareas, crea un nuevo sprint.
            </p>
            <Alert variant="warning" className="max-w-md mx-auto">
              <AlertTitle>Sugerencia</AlertTitle>
              <AlertDescription>
                Crea un sprint para organizar y planificar las tareas de tu
                equipo en un período específico.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
      <NewTaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        addNewTask={addNewTask}
        teamMembers={teamMembers}
      />
    </div>
  );
}
