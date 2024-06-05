"use client"

import { addDoc, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CiLogout } from "react-icons/ci";
import { auth, db } from '../../../firebase';
import { useAppContext } from '@/context/AppContext';
// import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const { user, userId, selectedRoom,  setSelectedRoom, selectedRoomName, setSelectedRoomName } = useAppContext();
    const [rooms, setRooms] = useState<{id: string; name: string}[]>([]);
    // const router = useRouter();
    
    const selectRoom = (roomId: string, roomName: string) => {
        setSelectedRoom(roomId);
        setSelectedRoomName(roomName);
    };

    const addNewRoom = async () => {
        const roomName = prompt("What's the room name?")
        if (roomName) {
            const newRoomRef = collection(db, "rooms");
            await addDoc(newRoomRef, {
                name: roomName,
                userId: userId,
                createdAt: serverTimestamp(),
            });


        }
    };

    const handleLogout = () => {
        auth.signOut();
        // router.push("/auth/login")
    };

    const deleteRoom = async (roomId: string) => {
        const roomDocRef = doc(db, "rooms", roomId);
        const messageDeleteRef = collection(roomDocRef, "messages");
        await deleteDoc(doc(db, "rooms", roomId));
        const q = query(messageDeleteRef, orderBy("createdAt"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docs.forEach(async (document) => {
                await deleteDoc(doc(roomDocRef, "messages", document.id));
            });
        });
        setSelectedRoom(null);
        setSelectedRoomName(null);
        
        return () => {
            unsubscribe();
        };
    };

    useEffect(() => {
        const fetchRooms = async () => {
            const roomCollectionRef = collection(db, "rooms");
            const q = query(roomCollectionRef, where("userId", "==", userId), orderBy("createdAt"));

            // onSnapshot関数で監視をし続ける
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRooms = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setRooms(newRooms);
                console.log(newRooms);

                if (!selectedRoom && newRooms.length > 0) {
                    setSelectedRoom(newRooms[0].id);
                    setSelectedRoomName(newRooms[0].name);
                    
                }
            });

            return () => {
                unsubscribe();
            };
        };

        fetchRooms();
    }, [userId]);

  return (
    // overflow-y-auto → 縦一杯になったとき、自動的にスクロールバーが追加される
    <div className='h-full overflow-y-auto bg-custom-blue px-5 flex flex-col'>
        <div className='flex-grow'>
            <div onClick={addNewRoom}
                 className='cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-800 duration-150'>
                <span className='text-white p-4 text-2xl'>＋</span>
                <h1 className='text-white text-xl font-semibold p-4'>New Chat</h1>
            </div>
            <ul>
                {rooms.map((room) => (
                    <>
                        <div className='flex justify-between'>
                            <li key={room.id}
                                className='cursor-pointer border-b w-36 p-4 text-slate-100 hover:bg-slate-700 duration-150'
                                onClick={() => selectRoom(room.id, room.name)}>
                                {room.name}
                            </li>
                            <button onClick={() => deleteRoom(room.id)}
                                    className='text-slate-100 bg-slate-500 my-3 px-2 border rounded-md text-sm'>Delete</button>
                        </div>
                    </>
                ))}
                {/* <li className='cursor-pointer border-b p-4 text-slate-100 hover:bg-slate-700 duration-150'>
                    Room 2
                </li>
                <li className='cursor-pointer border-b p-4 text-slate-100 hover:bg-slate-700 duration-150'>
                    Room 3
                </li>
                <li className='cursor-pointer border-b p-4 text-slate-100 hover:bg-slate-700 duration-150'>
                    Room 4
                </li> */}
            </ul>
        </div>

        {user && <div className='mb-2 p-4 text-center text-slate-100 text-lg text-medium'>{user.email}</div>}
        <div onClick={() => handleLogout()}
             className='flex items-center mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150'>
            <CiLogout />
            <span className='ms-2 text-lg'>Log Out</span>
        </div>
    </div>
  );
};

export default Sidebar