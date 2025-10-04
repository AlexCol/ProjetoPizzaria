import FontAwesome from '@react-native-vector-icons/fontawesome6';
import React from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TaskListItem from './components/taskListItem';
import useTasks from './tasks.states';
import styles from './tasks.styles';

function Tasks() {
  const states = useTasks();
  const { taskRef, taskInputRef, taskList, buttonAdd } = states;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Type your task...'
          onChangeText={(text) => taskRef.current = text}
          ref={taskInputRef}
        />
        <TouchableOpacity style={styles.buttonAdd} onPress={buttonAdd}>
          <FontAwesome name='plus' iconStyle='solid' size={20} color={"#fff"} />
        </TouchableOpacity>
      </View>

      <FlatList
        keyExtractor={(item) => item.key.toString() ?? ""}
        data={taskList}
        renderItem={({ item }) => <TaskListItem task={item} states={states} />}
        ListEmptyComponent={<Text>No tasks founded.</Text>}
        showsVerticalScrollIndicator={false}
      />

    </View>
  )
}

export default Tasks;