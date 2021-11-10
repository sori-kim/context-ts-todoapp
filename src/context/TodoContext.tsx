import { createContext, Dispatch, useReducer, useContext } from "react";
import { todos } from "../constant";

export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

type TodoState = Todo[];

// Provider를 사용하지 않았을때에는 context 값이 undefind
const TodosStateContext = createContext<TodoState | undefined>(undefined);

// 액션을 위한 타입 선언 (create, toggle, remove)
type Action =
    | { type: "CREATE"; text: string }
    | { type: "TOGGLE"; id: number }
    | { type: "REMOVE"; id: number };

type TodoDispatch = Dispatch<Action>;

const TodosDispatchContext = createContext<TodoDispatch | undefined>(undefined);

function todosReducer(state: TodoState, action: Action) {
    switch (action.type) {
        case "CREATE":
            const nextId = Math.max(...state.map((todo) => todo.id)) + 1;
            return state.concat({
                id: nextId,
                text: action.text,
                done: false,
            });
        case "TOGGLE":
            return state.map((todo) =>
                todo.id === action.id ? { ...todo, done: !todo.done } : todo
            );
        case "REMOVE":
            return state.filter((todo) => todo.id !== action.id);

        default:
            throw new Error(`Unhandled action`);
    }
}

// context를 사용할 때 타입이 undefind 또는 TodosState이기 때문에 값이 유효한지 확인을 해야함. 커스텀 훅으로 분리
export function useTodosState() {
    const state = useContext(TodosStateContext);
    if (!state) throw new Error("TodosProvider not found");
    return state;
}

export function useTodosDispatch() {
    const dispatch = useContext(TodosDispatchContext);
    if (!dispatch) throw new Error("TodosProvider not found");
    return dispatch;
}

export function TodosContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [todoState, dispatch] = useReducer(todosReducer, todos);

    return (
        <TodosDispatchContext.Provider value={dispatch}>
            <TodosStateContext.Provider value={todoState}>
                {children}
            </TodosStateContext.Provider>
        </TodosDispatchContext.Provider>
    );
}
