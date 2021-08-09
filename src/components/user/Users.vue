<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="30">
                <el-col :span="10">
                    <el-input
                        placeholder="请输入内容"
                        v-model="queryInfo.query"
                        clearable
                        @keyup.enter.native="getUserList"
                        @clear="getUserList"
                    >
                        <el-button
                            slot="append"
                            icon="el-icon-search"
                            @click="getUserList"
                        ></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">
                        添加用户
                    </el-button>
                </el-col>
            </el-row>
            <el-table :data="userList" border stripe>
                <el-table-column type="index" />
                <el-table-column label="姓名" prop="username" />
                <el-table-column label="邮箱" prop="email" />
                <el-table-column label="电话" prop="mobile" />
                <el-table-column label="角色" prop="role_name" />
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.mg_state"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            @change="userStateChanged(scope.row)"
                        >
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="showEditDialog(scope.row.id)"
                        ></el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            size="mini"
                            @click="removeUserById(scope.row.id)"
                        ></el-button>
                        <el-tooltip
                            effect="dark"
                            content="分配角色"
                            placement="top"
                            :enterable="false"
                        >
                            <el-button
                                type="warning"
                                icon="el-icon-setting"
                                size="mini"
                            />
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </el-card>
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
        >
            <el-form
                :model="addForm"
                :rules="addFormRules"
                ref="addFormRef"
                label-width="70px"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false"> 取 消 </el-button>
                <el-button type="primary" @click="addUser"> 确 定 </el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
        >
            <el-form
                :model="editForm"
                :rules="editFormRules"
                ref="editFormRef"
                label-width="70px"
            >
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "Users",
    data() {
        let vlidateComfirmEmail = (rule, value, callback) => {
            const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (!reg.test(value)) callback(new Error("邮箱格式有误"));
            callback();
        };
        let vlidateComfirmMobile = (rule, value, callback) => {
            const reg =
                /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            if (!reg.test(value)) callback(new Error("手机号格式有误"));
            callback();
        };
        return {
            queryInfo: {
                query: "",
                pagenum: 1,
                pagesize: 2,
            },
            userList: [],
            total: 0,
            addDialogVisible: false,
            addForm: {
                username: "321",
                password: "123123",
                email: "12@q.q",
                mobile: "13322224444",
            },
            addFormRules: {
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 10,
                        message: "用户名的长度在 3 到 10 个字符",
                        trigger: "blur",
                    },
                ],
                password: [
                    {
                        required: true,
                        message: "请输入密码",
                        trigger: "blur",
                    },
                    {
                        min: 6,
                        max: 18,
                        message: "密码的长度在 6 到 18 个字符",
                        trigger: "blur",
                    },
                ],
                email: [
                    {
                        required: true,
                        message: "请输入邮箱",
                        trigger: "blur",
                    },
                    {
                        validator: vlidateComfirmEmail,
                        trigger: "blur",
                    },
                ],
                mobile: [
                    {
                        required: true,
                        message: "请输入手机号",
                        trigger: "blur",
                    },
                    {
                        validator: vlidateComfirmMobile,
                        trigger: "blur",
                    },
                ],
            },
            editDialogVisible: false,
            editForm: {},
        };
    },
    computed: {
        editFormRules() {
            return (({ email, mobile }) => ({ email, mobile }))(
                this.addFormRules
            );
        },
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get("users", {
                params: this.queryInfo,
            });
            if (res.meta.status !== 200)
                return this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "error",
                });
            this.userList = res.data.users;
            this.total = res.data.total;
            if(this.queryInfo.pagenum * this.queryInfo.pagesize > this.total) 
                this.queryInfo.pagenum -= 1
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },
        handleCurrentChange(newPage) {
            
            console.log("newPage", newPage);
            this.queryInfo.pagenum = newPage;
            this.getUserList();
        },
        async userStateChanged(userInfo) {
            const { data: res } = await this.$http.put(
                `users/${userInfo.id}/state/${userInfo.mg_state}`
            );
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "error",
                });
            }
            this.$message({
                duration: 2000,
                message: res.meta.msg,
                type: "success",
            });
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        addUser() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return;
                const { data: res } = await this.$http.post(
                    "users",
                    this.addForm
                );
                if (res.meta.status !== 201)
                    return this.$message({
                        duration: 2000,
                        message: res.meta.msg,
                        type: "error",
                    });
                this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "success",
                });
                this.addDialogVisible = false;
                this.getUserList();
            });
        },
        async showEditDialog(id) {
            const { data: res } = await this.$http.get("users/" + id);
            if (res.meta.status !== 200)
                return this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "error",
                });
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        editUserInfo() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return;
                const { data: res } = await this.$http.put(
                    "users/" + this.editForm.id,
                    { email: this.editForm.email, mobile: this.editForm.mobile }
                );
                if (res.meta.status !== 200)
                    return this.$message({
                        duration: 2000,
                        message: res.meta.msg,
                        type: "error",
                    });
                this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "success",
                });
                this.editDialogVisible = false;
                this.getUserList();
            });
        },
        removeUserById(id) {
            const comfirmResult = this.$confirm(
                "此操作将永久删除该用户, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(() => {
                    this.$http.delete("users/" + id).then((res) => {
                        // console.log(res)
                        if (res.status !== 200)
                            return this.$message({
                                duration: 2000,
                                message: res.data.meta.msg,
                                type: "error",
                            });
                        this.$message({
                            duration: 2000,
                            message: res.data.meta.msg,
                            type: "success",
                        });
                        this.getUserList();
                    });
                })
                .catch(() => {
                    this.$message({
                        duration: 2000,
                        type: "info",
                        message: "已取消删除",
                    });
                });
        },
    },
    created() {
        this.getUserList();
    },
};
</script>

<style lang="less" scoped>
</style>