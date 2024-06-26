import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { ToDoItemComponent } from '../../components/ToDoItemComponent';
import { Item } from '../../components/Item';
import { getDBConnection, getTodoItems, saveTodoItems, createTable, deleteTodoItem } from './db-services';
const List = () => {
  const [todos, setTodos] = useState<Item[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const loadDataCallback = useCallback(async () => {
    try {
      const initTodos = [{ id: 0, value: 'go to shop' }, { id: 1, value: 'eat at least a one healthy foods' }, { id: 2, value: 'Do some exercises' }];
      const db = await getDBConnection();
      await createTable(db);
      const storedTodoItems = await getTodoItems(db);
      if (storedTodoItems.length) {
        setTodos(storedTodoItems);
      } else {
        await saveTodoItems(db, initTodos);
        setTodos(initTodos);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);
  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const newTodos = [...todos, {
        id: todos.length ? todos.reduce((acc, cur) => {
          if (cur.id > acc.id) return cur;
          return acc;
        }).id + 1 : 0, value: newTodo
      }];
      setTodos(newTodos);
      const db = await getDBConnection();
      await saveTodoItems(db, newTodos);
      setNewTodo('');
    } catch (error) {
      console.error(error);
    }
  };
  const deleteItem = async (id: number) => {
    try {
      const db = await getDBConnection();
      await deleteTodoItem(db, id);
      todos.splice(id, 1);
      setTodos(todos.slice(0));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
        <View style={styles.whole}>
          {todos.map((todo) => (
            <ToDoItemComponent key={todo.id} todo={todo} deleteItem={deleteItem} />
          ))}
        </View>
        <View style={styles.textInputContainer}>
          <TextInput style={styles.textInput} value={newTodo} onChangeText={text => setNewTodo(text)} />
          <Button
            onPress={addTodo}
            title="Add ToDo"
            color="#007bff"
            accessibilityLabel="add todo item"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  scroll:{
    height: 1000,
  },
  whole:{
    paddingVertical: 10,
  },
  appTitleText: {
    fontSize: 24,
    fontWeight: '800'
  },
  textInputContainer: {
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    height: 35,
    margin: 10,
    marginHorizontal: 20,
    backgroundColor: 'white'
  },
});
export default List;