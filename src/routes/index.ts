/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { getAllAduans } from './Aduans';
import { getAllRoles } from './Roles';
import { getUserPelapor, addOneUser, updateOneUser, deleteOneUser, getUserLembaga } from './Users';
import { getTest } from './Test';


// User-route
const userRouter = Router();
userRouter.get('/pelapor', getUserPelapor);
userRouter.get('/lembaga', getUserLembaga);
userRouter.post('/add', addOneUser);
userRouter.put('/update', updateOneUser);
userRouter.delete('/delete/:id', deleteOneUser);

// Aduan Route
const aduanRouter = Router();
aduanRouter.get('/all', getAllAduans);

// Role Route
const roleRouter = Router();
roleRouter.get('/all', getAllRoles);

// Test Route
const testRouter = Router();
testRouter.get('/', getTest);


// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/aduan', aduanRouter);
baseRouter.use('/roles', roleRouter);
baseRouter.use('/test', testRouter)
export default baseRouter;
