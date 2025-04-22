import Head from "next/head";
import styles from "./Task.module.css"
import { GetServerSideProps } from "next";
import { db } from "@/services/firebaseConnection";
import { doc, collection, query, where, getDoc } from "firebase/firestore";

interface TaskProps {
    item: {
        tarefa: string;
        publica: boolean;
        created: string;
        user: string;
        taskId: string;
    }
}

export default function Task({ item }: TaskProps) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>
        </div>
    )
}


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string

    const docRef = doc(db, "tasks", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    if (!snapshot.data()?.publica) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        publica: snapshot.data()?.publica,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    // console.log(task)


    return {
        props: {
            item: task,
        },
    }
}