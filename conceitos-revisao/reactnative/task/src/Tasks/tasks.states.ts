import { RefObject, useRef, useState } from "react";
import { Alert, Keyboard, TextInput } from "react-native";
import Task from "../model/Task";

export default function useTasks() {
  const taskRef = useRef<string>(""); //para ter a variavel em memoria sem re-renderizar
  const taskInputRef = useRef<TextInput>(null) as RefObject<TextInput>; //para ter acesso ao componente em si
  const [taskList, setTaskList] = useState<Task[]>([]);

  /************************************/
  /* METODOS PARA CONTROLE DOS ESTADOS*/
  /************************************/
  function buttonAdd() {
    if (!taskRef.current) {
      Alert.alert('Error', "Task can't be empty.")
      return;
    }

    let nextKey = 1;
    if (taskList.length > 0) {
      nextKey = Math.max(...taskList.map(t => t.key)) + 1;
    }

    const newTask: Task = {
      key: nextKey,
      description: taskRef.current
    }

    setTaskList((prev) => [...prev, newTask]); // ✅ cria novo array
    clearRefs();
  }

  function remove(key: number) {
    setTaskList(prev => prev.filter(t => t.key !== key));
  }

  function clearRefs() {
    taskRef.current = "";
    taskInputRef.current.clear();
    Keyboard.dismiss(); // Fecha o teclado
  }

  return {
    taskRef, taskInputRef,
    taskList,
    buttonAdd, clearRefs, remove,
  }
}
export type useTasksType = ReturnType<typeof useTasks>;