import React, { useState } from 'react'


const ChangePassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    

    function handleSubmit (e) {
        e.preventDefault();
        setLoading(true);
        let newErrors = {};

        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
          newErrors.password = "Must be 8+ chars with a special character.";
        }

        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match.";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
        }
        try {
            
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='flex'>
        <form onSubmit={handleSubmit}>
            <div>
                {/* <label>New Password</label> */}
                <input type="password" required 
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value.replace(/\s/g, ""))
                        if(errors.password) {
                            setErrors((prev) => {
                              const {password, ...rest} = prev;
                              return rest;
                            })
                          }
                    }}
                    placeholder='New Password'
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-black ${errors.password ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300'}`}
                />
                {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
            </div>

            <div>
                {/* <label>Confirm Password</label>  */}
                <input type="password" required
                    value={confirmPassword}
                    onChange={(e) => {setConfirmPassword(e.target.value.replace(/\s/g, ""));
                        if(errors.confirmPassword) {
                            setErrors((prev) => {
                                const {confirmPassword, ...rest} = prev;
                                return rest;
                            })
                        }
                    }}
                    placeholder='Confirm Password'
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-black ${errors.confirmPassword ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300 mt-2'}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1"> {errors.confirmPassword} </p> }
            </div>
            <button type='submit'
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-400 mt-2"
            >
                {loading?"Please Wait":"Confirm Reset"}
            </button>
        </form>
    </div>
  )
}

export default ChangePassword