import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { register as registerUser } from '../../features/auth/authSlice';
import { BookOpen, Loader2 } from 'lucide-react';

//Form validation schema
const signUpSchema = z.object({
    name:z.string().min(2, 'Name must be at least 2 characters long'),
    email:z.string().email('Please enter a valid email address'),
    password:z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword,{
    message:'Password do not match',
    path:['confirmPassword'],
});

const SignUp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {isLoading} = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState:{errors},
    }= useForm({
        resolver:zodResolver(signUpSchema),
        defaultValues:{
            name:'',
            email:'',
            password:'',
            confirmPassword:'',
        },
    });

    const onSubmit = async(data) => {
        //Remove confirmPassword before sending to API
        const {...userData} = data;
        const resultAction = await dispatch(registerUser(userData));
        if(registerUser.fulfilled.match(resultAction)){
            navigate('/')
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
     <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md my-7'>
        <div className='text-center'>
            <Link to={'/'} className='flex items-center justify-center'>
             <BookOpen className='h-10 w-10 text-[#0284c7]'/>
             <span className='ml-2 text-2xl font-bold text-gray-900'>BookStore</span>
            </Link>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Create your account</h2>
            <p className='mt-2 text-sm text-gray-600'>Or {' '}
            <Link to={'/signin'} className='font-medium text-[#0284c7] hover:text-[#0ea5e9]'>
             sign in to your existing account
            </Link> 
            </p>  
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-4'>
                <div>
                    <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                        Full Name
                    </label>
                    <div className='mt-1'>
                        <input
                        id='name'
                        type='text'
                        autoComplete='name'
                        className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                        {...register('name')}
                        />
                        {errors.name && (
                            <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
                        )}
                    </div>
                </div>
                <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            </div>
            
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>
          <div>
            <button
             type='submit'
             disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0284c7] hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer'>
                {isLoading ? (
                    <>
                    <Loader2 className='animate-spin h-5 w-5 mr-2'/>
                     Creating account.......
                    </>
                ):(
                    'Sign Up'
                )}
            </button>
          </div>
        </form>
     </div>
    </div>
  )
}

export default SignUp