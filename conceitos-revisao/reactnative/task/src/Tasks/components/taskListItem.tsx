import FontAwesome from '@react-native-vector-icons/fontawesome6';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Task from '../../model/Task';
import { useTasksType } from '../tasks.states';
import stylesListItem from './taskListItem.styles';

type TaskListItemProps = {
  task: Task,
  states: useTasksType
}

export default function TaskListItem({ task, states }: TaskListItemProps) {
  return (
    <View style={stylesListItem.container}>
      <TouchableOpacity style={stylesListItem.removeButton} onPress={() => states.remove(task.key)}>
        <FontAwesome name='trash-can' iconStyle='solid' size={20} color={"#22272e"} />
      </TouchableOpacity>

      <Text style={stylesListItem.taskText}>{task.key} - {task.description}</Text>
    </View>
  )
}