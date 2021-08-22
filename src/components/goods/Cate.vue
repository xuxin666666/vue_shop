<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">
                        添加分类
                    </el-button>
                </el-col>
            </el-row>
            <tree-table
                class="treeTable"
                :data="catelist"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false"
            >
                <template slot="isok" slot-scope="scope">
                    <i
                        class="el-icon-success"
                        v-if="!scope.row.cat_delete"
                        style="color: lightgreen"
                    ></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">
                        一级
                    </el-tag>
                    <el-tag
                        type="success"
                        size="mini"
                        v-else-if="scope.row.cat_level === 1"
                    >
                        二级
                    </el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope" >
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">
                        编辑
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">
                        删除
                    </el-button>
                </template>
            </tree-table>
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
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close='addCateDialogClosed'
        >
            <el-form
                :model="addCateForm"
                :rules="addCateFormRules"
                ref="addCateFormRef"
                label-width="100px"
            >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChanged"
                        clearable
                    ></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">
                    取 消
                </el-button>
                <el-button type="primary" @click="addCate">
                    确 定
                </el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="编辑"
            :visible.sync="editCateDialogVisible"
            width="50%"
            @close='editCateDialogClosed'
        >
            <el-form
                :model="editCateForm"
                :rules="addCateFormRules"
                ref="editCateFormRef"
                label-width="100px"
            >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">
                    取 消
                </el-button>
                <el-button type="primary" @click="editCate">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "Cate",
    data() {
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5,
            },
            catelist: [],
            total: 0,
            columns: [
                {
                    label: "分类名称",
                    prop: "cat_name",
                },
                {
                    label: "是否有效",
                    type: "template",
                    template: "isok",
                },
                {
                    label: "排序",
                    type: "template",
                    template: "order",
                },
                {
                    label: "操作",
                    type: "template",
                    template: "opt",
                    minWidth: '120px'
                },
            ],
            addCateDialogVisible: false,
            editCateDialogVisible: false,
            addCateForm: {
                cat_name: "",
                cat_pid: 0,
                cat_level: 0,
            },
            editCateForm: {
                cat_name: '',
                cat_id: 0
            },
            addCateFormRules: {
                cat_name: [
                    {
                        required: true,
                        message: "请输入分类名称",
                        trigger: "blur",
                    },
                ],
            },
            parentCateList: [],
            cascaderProps: {
                expandTrigger: "hover",
                checkStrictly: true,
                value: "cat_id",
                label: "cat_name",
                children: "children",
            },
            selectedKeys: [],
        };
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get("categories", {
                params: this.queryInfo,
            });
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            this.catelist = res.data.result;
            this.total = res.data.total;
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getCateList();
        },
        showAddCateDialog() {
            this.getParentCateList();
            this.addCateDialogVisible = true;
        },
        async showEditCateDialog(id){
            const { data: res } = await this.$http.get("categories/" + id);
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            this.editCateForm = res.data;
            this.editCateDialogVisible = true
        },
        async getParentCateList() {
            const { data: res } = await this.$http.get("categories", {
                params: { type: 2 },
            });
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            this.parentCateList = res.data;
        },
        parentCateChanged() {
            let len = this.selectedKeys.length;
            if (len > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[len - 1];
                this.addCateForm.cat_level = len;
            } else {
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        addCate(){
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid) return

                const {data: res} = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201)
                return this.$message.error(res.meta.msg);

                this.$message.success('添加分类成功!');
                this.addCateDialogVisible = false
                this.getCateList()
            })
        },
        editCate(){
            this.$refs.editCateFormRef.validate(async valid => {
                if(!valid) return

                const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {cat_name: this.editCateForm.cat_name})
                if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

                this.$message.success('编辑成功!');
                this.editCateDialogVisible = false
                this.getCateList()
            })
        },
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;
        },
        editCateDialogClosed(){
            this.$refs.editCateFormRef.resetFields()
        },
        async deleteCate(id) {
            const confirmResult = await this.$confirm(
                "此操作将永久删除该类商品, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            ).catch(() => {
                this.$message.info("已取消删除");
            });
            if (confirmResult === "confirm") {
                this.$http.delete("categories/" + id).then((res) => {
                    if (res.status !== 200)
                        return this.$message.error(res.data.meta.msg);
                    this.$message.success(res.data.meta.msg);
                    this.getCateList();
                });
            }
        },
    },
    created() {
        this.getCateList();
    },
};
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>