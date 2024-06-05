// 以下の一文がないとエラーが出る
"use client"

import { createUserWithEmailAndPassword } from 'firebase/auth';
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { auth } from '../../../../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Inputs = {
    email: string;
    password: string;
};

const Register = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Inputs>();

    // if email and password are appropriate, then sign up
    const onsubmit: SubmitHandler<Inputs> = async (data) => {
        await createUserWithEmailAndPassword(auth, data.email, data.password).then(
            (userCrendential) => {
                const user = userCrendential.user;
                router.push("/auth/login");
        }).catch((error) => {
            // alert(error);
            if (error.code === "auth/email-already-in-use") {
                alert("This email address is being used.")
            } else {
                alert(error.message);
            }
        });
    };

  return (
    <div className='h-screen flex flex-col items-center justify-center'>
        <form onSubmit={handleSubmit(onsubmit)} className='bg-white p-8 rounded-lg shadow-md w-100'>
            <h1 className='mb-4 text-2xl text-gray-700 font-medium'>
                Create Your Account
            </h1>
            <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600'>
                    Email
                </label>
                <input 
                    {...register("email", {
                        required: "Enter your email address.",
                        pattern: {
                            value:
                            /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                            message: "It's not an inappropriate email address."
                        }
                    })} type='text' className='mt-1 border-2 rounded-md w-full p-2'></input>
                    {errors.email && <span className='text-red-600 text-sm'>{errors.email.message}</span>}
            </div>
            <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600'>
                    Password
                </label>
                <input 
                    {...register("password", {
                        required: "Enter your password address.",
                        minLength: {
                            value: 6,
                            message: "Password needs more than 6 letters."
                        }    
                    })} type='password' className='mt-1 border-2 rounded-md w-full p-2'></input>
                    {errors.password && <span className='text-red-600 text-sm'>{errors.password.message}</span>}
            </div>

            <div className='flex justify-end'>
                <button type='submit' className='bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700'>
                    Sign Up
                </button>
            </div>
            <div className='mt-4'>
                <span className='text-gray-600 text-sm'>
                    Do you have your account already?
                </span>
                <Link href={"/auth/login"} className='text-blue-500 text-sm font-bold ml-1 hover:text-blue-700'>
                    Login Page here
                </Link>
            </div>
        </form>
    </div>
  )
};

export default Register