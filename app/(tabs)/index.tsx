import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  Button, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Switch,
  ScrollView,
  Platform
} from 'react-native';

interface Task {
  key: string;
  value: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
}

const App: React.FC = () => {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskKey, setCurrentTaskKey] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'Task completed'>('all');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [category, setCategory] = useState<string>('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [isLandscape, setIsLandscape] = useState(Dimensions.get('window').width > Dimensions.get('window').height);

  const categories = Array.from(new Set(taskList.map(task => task.category).filter(Boolean))) as string[];

  const addTask = () => {
    if (task.trim() !== '') {
      const newTask: Task = {
        key: Math.random().toString(),
        value: task,
        completed: false,
        createdAt: new Date(),
        priority,
        dueDate,
        category: category.trim() || undefined
      };
      setTaskList([...taskList, newTask]);
      setTask('');
      setPriority('medium');
      setDueDate(undefined);
      setCategory('');
      setShowCategoryInput(false);
    }
  };

  const editTask = (key: string) => {
    const taskToEdit = taskList.find((task) => task.key === key);
    if (taskToEdit) {
      setTask(taskToEdit.value);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setCategory(taskToEdit.category || '');
      setIsEditing(true);
      setCurrentTaskKey(key);
    }
  };

  const updateTask = () => {
    if (currentTaskKey) {
      setTaskList(
        taskList.map((taskItem) =>
          taskItem.key === currentTaskKey 
            ? { 
                ...taskItem, 
                value: task, 
                priority,
                dueDate,
                category: category.trim() || undefined
              } 
            : taskItem
        )
      );
      setTask('');
      setPriority('medium');
      setDueDate(undefined);
      setCategory('');
      setIsEditing(false);
      setCurrentTaskKey(null);
      setShowCategoryInput(false);
    }
  };

  const deleteTask = (key: string) => {
    setTaskList(taskList.filter((task) => task.key !== key));
  };

  const toggleTaskCompletion = (key: string) => {
    setTaskList(
      taskList.map((taskItem) =>
        taskItem.key === key ? { ...taskItem, completed: !taskItem.completed } : taskItem
      )
    );
  };

 

  const sortTasksByPriority = () => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    setTaskList([...taskList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]));
  };

  const sortTasksByDate = () => {
    setTaskList([...taskList].sort((a, b) => {
      const aDate = a.dueDate || a.createdAt;
      const bDate = b.dueDate || b.createdAt;
      return aDate.getTime() - bDate.getTime();
    }));
  };

  const sortTasksByCategory = () => {
    setTaskList([...taskList].sort((a, b) => {
      const aCat = a.category || 'zzz';
      const bCat = b.category || 'zzz';
      return aCat.localeCompare(bCat);
    }));
  };

  const filteredTasks = taskList.filter(task => {
    const matchesSearch = task.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'Task completed' && task.completed) || 
      (filter === 'active' && !task.completed);
    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      (selectedCategoryFilter === 'uncategorized' && !task.category) ||
      task.category === selectedCategoryFilter;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
    }
  };

  const getDueDateStatus = (dueDate?: Date) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const isSmallScreen = screenWidth < 350;
  const isTablet = screenWidth >= 600;
  const isLargeTablet = screenWidth >= 900;

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.contentContainer,
          isTablet && styles.tabletContentContainer,
          isLargeTablet && styles.largeTabletContentContainer
        ]}>
          <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>✨GroupNipaling✨</Text>

          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, darkMode ? styles.darkText : styles.lightText]}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, darkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Search tasks..."
              placeholderTextColor={darkMode ? '#aaa' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Add a new task..."
              placeholderTextColor={darkMode ? '#aaa' : '#666'}
              value={task}
              onChangeText={setTask}
              onSubmitEditing={isEditing ? updateTask : addTask}
            />
            <TouchableOpacity
              style={[styles.actionButton, isEditing ? styles.updateButton : styles.addButton]}
              onPress={isEditing ? updateTask : addTask}
            >
              <Text style={styles.buttonText}>{isEditing ? 'UPDATE' : 'ADD'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.priorityContainer,
            isSmallScreen && styles.smallPriorityContainer
          ]}>
            <Text style={[styles.priorityLabel, darkMode ? styles.darkText : styles.lightText]}>Priority:</Text>
            <View style={styles.priorityButtonsContainer}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && { backgroundColor: getPriorityColor(level) },
                    { borderColor: getPriorityColor(level) }
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === level ? styles.selectedPriorityText : { color: getPriorityColor(level) }
                  ]}>
                    {isSmallScreen ? level.charAt(0).toUpperCase() : level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dueDateContainer}>
            <TouchableOpacity
              style={[styles.dueDateButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
              onPress={() => setShowDueDatePicker(!showDueDatePicker)}
            >
              <Text style={[styles.dueDateButtonText, darkMode ? styles.darkText : styles.lightText]}>
                {dueDate ? `Due: ${dueDate.toLocaleDateString()}` : 'Set Due Date'}
              </Text>
            </TouchableOpacity>
            
            {showDueDatePicker && (
              <View style={[
                styles.datePickerContainer,
                isLandscape && styles.landscapeDatePickerContainer
              ]}>
                <Button
                  title="Today"
                  onPress={() => {
                    const today = new Date();
                    setDueDate(today);
                    setShowDueDatePicker(false);
                  }}
                />
                <Button
                  title="Tomorrow"
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setDueDate(tomorrow);
                    setShowDueDatePicker(false);
                  }}
                />
                <Button
                  title="Next Week"
                  onPress={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setDueDate(nextWeek);
                    setShowDueDatePicker(false);
                  }}
                />
                <Button
                  title="Back"
                  color="#dc3545"
                  onPress={() => {
                    setDueDate(undefined);
                    setShowDueDatePicker(false);
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.categoryContainer}>
            {!showCategoryInput ? (
              <TouchableOpacity
                style={[styles.categoryButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
                onPress={() => setShowCategoryInput(true)}
              >
                <Text style={[styles.categoryButtonText, darkMode ? styles.darkText : styles.lightText]}>
                  {category ? `Category: ${category}` : 'Add Category'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.categoryInputContainer}>
                <TextInput
                  style={[styles.categoryInput, darkMode ? styles.darkInput : styles.lightInput]}
                  placeholder="Enter category..."
                  placeholderTextColor={darkMode ? '#aaa' : '#666'}
                  value={category}
                  onChangeText={setCategory}
                  onSubmitEditing={() => setShowCategoryInput(false)}
                />
                <TouchableOpacity
                  style={[styles.categoryDoneButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
                  onPress={() => setShowCategoryInput(false)}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[
            styles.filterContainer,
            isSmallScreen && styles.smallFilterContainer
          ]}>
            {(['all', 'active', 'Task completed'] as const).map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && (darkMode ? styles.darkFilterActive : styles.lightFilterActive)
                ]}
                onPress={() => setFilter(filterType)}
              >
                <Text style={[
                  styles.filterText,
                  darkMode ? styles.darkText : styles.lightText,
                  filter === filterType && styles.activeFilterText
                ]}>
                  {isSmallScreen ? 
                    filterType === 'all' ? 'All' : 
                    filterType === 'active' ? 'Active' : 'Done' 
                    : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {categories.length > 0 && (
            <View style={styles.categoryFilterContainer}>
              <Text style={[styles.categoryFilterLabel, darkMode ? styles.darkText : styles.lightText]}>
                Filter by Category:
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryFilterScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryFilterButton,
                    selectedCategoryFilter === 'all' && (darkMode ? styles.darkFilterActive : styles.lightFilterActive)
                  ]}
                  onPress={() => setSelectedCategoryFilter('all')}
                >
                  <Text style={[
                    styles.categoryFilterButtonText,
                    selectedCategoryFilter === 'all' && styles.activeFilterText
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryFilterButton,
                    selectedCategoryFilter === 'uncategorized' && (darkMode ? styles.darkFilterActive : styles.lightFilterActive)
                  ]}
                  onPress={() => setSelectedCategoryFilter('uncategorized')}
                >
                  <Text style={[
                    styles.categoryFilterButtonText,
                    selectedCategoryFilter === 'uncategorized' && styles.activeFilterText
                  ]}>
                    {isSmallScreen ? 'Uncat.' : 'Uncategorized'}
                  </Text>
                </TouchableOpacity>
                
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryFilterButton,
                      selectedCategoryFilter === cat && (darkMode ? styles.darkFilterActive : styles.lightFilterActive)
                    ]}
                    onPress={() => setSelectedCategoryFilter(cat)}
                  >
                    <Text style={[
                      styles.categoryFilterButtonText,
                      selectedCategoryFilter === cat && styles.activeFilterText,
                      cat.length > 8 && isSmallScreen && styles.smallCategoryText
                    ]}>
                      {isSmallScreen ? cat.substring(0, 5) + (cat.length > 5 ? '...' : '') : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[
            styles.actionButtonsContainer,
            isSmallScreen && styles.smallActionButtonsContainer
          ]}>
            <TouchableOpacity
              style={[styles.secondaryButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
              onPress={sortTasksByPriority}
            >
              <Text style={styles.secondaryButtonText}>
                {isSmallScreen ? 'Priority' : 'Sort by Priority'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
              onPress={sortTasksByDate}
            >
              <Text style={styles.secondaryButtonText}>
                {isSmallScreen ? 'Date' : 'Sort by Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, darkMode ? styles.darkSecondaryButton : styles.lightSecondaryButton]}
              onPress={sortTasksByCategory}
            >
              <Text style={styles.secondaryButtonText}>
                {isSmallScreen ? 'Category' : 'Sort by Category'}
              </Text>
            </TouchableOpacity>
          </View>

        

          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, darkMode ? styles.darkText : styles.lightText]}>
              {isSmallScreen ? (
                `T:${taskList.length} A:${taskList.filter(t => !t.completed).length} C:${taskList.filter(t => t.completed).length}`
              ) : (
                `Total: ${taskList.length} | Active: ${taskList.filter(t => !t.completed).length} | Completed: ${taskList.filter(t => t.completed).length}`
              )}
              {!isSmallScreen && categories.length > 0 && ` | Categories: ${categories.length}`}
            </Text>
          </View>

          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.key}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[
                styles.taskItem, 
                darkMode ? styles.darkTaskItem : styles.lightTaskItem,
                item.completed && styles.completedTask,
                { borderLeftWidth: 4, borderLeftColor: getPriorityColor(item.priority) },
                getDueDateStatus(item.dueDate) === 'overdue' && styles.overdueTask,
                getDueDateStatus(item.dueDate) === 'today' && styles.dueTodayTask
              ]}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => toggleTaskCompletion(item.key)}
                >
                  <View style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted,
                    { borderColor: getPriorityColor(item.priority) }
                  ]}>
                    {item.completed && (
                      <Text style={styles.checkboxIcon}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.taskTextContainer}
                  onPress={() => toggleTaskCompletion(item.key)}
                >
                  <Text style={[
                    styles.taskText,
                    darkMode ? styles.darkText : styles.lightText,
                    item.completed && styles.completedText
                  ]}>
                    {item.value}
                  </Text>
                  
                  <View style={styles.taskMeta}>
                    {item.category && (
                      <View style={[
                        styles.categoryPill,
                        { backgroundColor: darkMode ? '#343a40' : '#e9ecef' }
                      ]}>
                        <Text style={[
                          styles.categoryPillText,
                          darkMode ? styles.darkText : styles.lightText
                        ]}>
                          {isSmallScreen ? 
                            item.category.substring(0, 5) + (item.category.length > 5 ? '...' : '') : 
                            item.category}
                        </Text>
                      </View>
                    )}
                    
                    <Text style={[
                      styles.taskDate,
                      darkMode ? styles.darkDateText : styles.lightDateText,
                      item.completed && styles.completedText,
                      getDueDateStatus(item.dueDate) === 'overdue' && styles.overdueText,
                      getDueDateStatus(item.dueDate) === 'today' && styles.dueTodayText
                    ]}>
                      {isSmallScreen ? (
                        <>
                          {item.createdAt.toLocaleDateString([], {month: 'short', day: 'numeric'})}
                          {item.dueDate && (
                            <Text>
                              {' • '}
                              {item.dueDate.toLocaleDateString([], {month: 'short', day: 'numeric'})}
                              {getDueDateStatus(item.dueDate) === 'overdue' && ' (!)'}
                              {getDueDateStatus(item.dueDate) === 'today' && ' (T)'}
                            </Text>
                          )}
                        </>
                      ) : (
                        <>
                          {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {item.dueDate && (
                            <Text>
                              {' • Due: '}
                              {item.dueDate.toLocaleDateString()}
                              {getDueDateStatus(item.dueDate) === 'overdue' && ' (Overdue)'}
                              {getDueDateStatus(item.dueDate) === 'today' && ' (Today)'}
                            </Text>
                          )}
                        </>
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={[styles.taskButton, styles.editButton]}
                    onPress={() => editTask(item.key)}
                  >
                    <Text style={styles.buttonText}>{isSmallScreen ? 'E' : 'Edit'}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.taskButton, styles.deleteButton]}
                    onPress={() => deleteTask(item.key)}
                  >
                    <Text style={styles.buttonText}>{isSmallScreen ? 'D' : 'Delete'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, darkMode ? styles.darkText : styles.lightText]}>
                  {searchQuery ? 'No tasks match your search.' : 'No tasks yet. Add one to get started!'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tabletContentContainer: {
    paddingHorizontal: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  largeTabletContentContainer: {
    maxWidth: 1000,
  },
  lightContainer: {
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  lightText: {
    color: '#343a40',
  },
  darkText: {
    color: '#e9ecef',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
  lightInput: {
    borderColor: '#ced4da',
    backgroundColor: '#fff',
    color: '#495057',
  },
  darkInput: {
    borderColor: '#343a40',
    backgroundColor: '#1e1e1e',
    color: '#f8f9fa',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 70,
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  updateButton: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  smallPriorityContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  priorityLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  priorityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  priorityText: {
    fontWeight: '500',
    fontSize: 14,
  },
  selectedPriorityText: {
    color: '#fff',
  },
  dueDateContainer: {
    marginBottom: 15,
  },
  dueDateButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  dueDateButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  landscapeDatePickerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  categoryInputContainer: {
    flexDirection: 'row',
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
  categoryDoneButton: {
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 70,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  smallFilterContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  lightFilterActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  darkFilterActive: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  filterText: {
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  categoryFilterContainer: {
    marginBottom: 15,
  },
  categoryFilterLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  categoryFilterScroll: {
    paddingVertical: 4,
  },
  categoryFilterButton: {
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#dee2e6',
  },
  categoryFilterButtonText: {
    fontSize: 14,
  },
  smallCategoryText: {
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallActionButtonsContainer: {
    flexDirection: 'column',
  },
  secondaryButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  lightSecondaryButton: {
    borderColor: '#6c757d',
    backgroundColor: '#f8f9fa',
  },
  darkSecondaryButton: {
    borderColor: '#495057',
    backgroundColor: '#343a40',
  },
  secondaryButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  clearButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallClearButtonsContainer: {
    flexDirection: 'column',
  },
  clearButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  lightClearButton: {
    backgroundColor: '#dc3545',
  },
  darkClearButton: {
    backgroundColor: '#c82333',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    opacity: 0.8,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  lightTaskItem: {
    backgroundColor: '#fff',
  },
  darkTaskItem: {
    backgroundColor: '#1e1e1e',
  },
  completedTask: {
    opacity: 0.7,
  },
  overdueTask: {
    borderRightWidth: 4,
    borderRightColor: '#dc3545',
  },
  dueTodayTask: {
    borderRightWidth: 4,
    borderRightColor: '#17a2b8',
  },
  checkboxContainer: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 12,
  },
  taskDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  lightDateText: {
    color: '#6c757d',
  },
  darkDateText: {
    color: '#adb5bd',
  },
  overdueText: {
    color: '#dc3545',
  },
  dueTodayText: {
    color: '#17a2b8',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  taskActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  taskButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#17a2b8',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default App;