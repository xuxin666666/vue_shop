<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert
                title="注意：只允许为第三季分类设置相关参数"
                type="warning"
                show-icon
                :closable="false"
            ></el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cascaderProps"
                        @change="handleChanged"
                        clearable
                    ></el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="addDialogVisible = true"
                    >
                        添加参数
                    </el-button>
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                    v-for="(item, i) in scope.row.attr_vals"
                                    :key="i"
                                    closable
                                    @close="handleClose(i, scope.row)"
                                >
                                    {{ item }}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="
                                        handleInputConfirm(scope.row)
                                    "
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                >
                                    + New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column
                            label="参数名称"
                            prop="attr_name"
                        ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >
                                    编辑
                                </el-button>
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                >
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="addDialogVisible = true"
                    >
                        添加属性
                    </el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag
                                    v-for="(item, i) in scope.row.attr_vals"
                                    :key="i"
                                    closable
                                    @close="handleClose(i, scope.row)"
                                >
                                    {{ item }}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="
                                        handleInputConfirm(scope.row)
                                    "
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                >
                                    + New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column
                            label="属性名称"
                            prop="attr_name"
                        ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >
                                    编辑
                                </el-button>
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                >
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
        >
            <el-form
                :model="addForm"
                :rules="addFormRules"
                ref="addFormRef"
                label-width="100px"
            >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false"> 取 消 </el-button>
                <el-button type="primary" @click="addParams"> 确 定 </el-button>
            </span>
        </el-dialog>
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
        >
            <el-form
                :model="editForm"
                :rules="addFormRules"
                ref="editFormRef"
                label-width="100px"
            >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">
                    取 消
                </el-button>
                <el-button type="primary" @click="editParams">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "Params",
    data() {
        return {
            cateList: [],
            cascaderProps: {
                expandTrigger: "hover",
                value: "cat_id",
                label: "cat_name",
                children: "children",
            },
            selectedCateKeys: [],
            activeName: "many",
            manyTableData: [],
            onlyTableData: [],
            addDialogVisible: false,
            editDialogVisible: false,
            addForm: {
                attr_name: "",
            },
            editForm: {},
            addFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    computed: {
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true;
            }
            return false;
        },
        cateId() {
            if (this.selectedCateKeys.length === 3)
                return this.selectedCateKeys[2];
            return null;
        },
        titleText() {
            return this.activeName === "many" ? "动态参数" : "静态属性";
        },
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get("categories");
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            this.cateList = res.data;
        },
        handleChanged() {
            this.getParamsData();
        },
        handleTabClick() {
            this.getParamsData();
        },
        async getParamsData() {
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = [];
                this.manyTableData = []
                this.onlyTableData = []
                return;
            }
            const { data: res } = await this.$http.get(
                `categories/${this.cateId}/attributes`,
                { params: { sel: this.activeName } }
            );
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            res.data.forEach((item) => {
                item.attr_vals === ""
                    ? (item.attr_vals = [])
                    : (item.attr_vals = item.attr_vals.split(","));
                item.inputVisible = false;
                item.inputValue = "";
            });
            if (this.activeName === "many") {
                this.manyTableData = res.data;
            } else {
                this.onlyTableData = res.data;
            }
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        addParams() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return;
                const { data: res } = await this.$http.post(
                    `categories/${this.cateId}/attributes`,
                    {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName,
                    }
                );
                if (res.meta.status !== 201)
                    return this.$message.error(res.meta.msg);
                this.$message.success("添加参数成功！");

                this.addDialogVisible = false;
                this.getParamsData();
            });
        },
        async showEditDialog(id) {
            const { data: res } = await this.$http.get(
                `categories/${this.cateId}/attributes/${id}`,
                { params: { attr_sel: this.activeName } }
            );
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);

            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editParams() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return;
                const { data: res } = await this.$http.put(
                    `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                    {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName,
                    }
                );
                if (res.meta.status !== 200)
                    return this.$message.error(res.meta.msg);
                this.$message.success("修改参数成功");

                this.getParamsData();
                this.editDialogVisible = false;
            });
        },
        async removeParams(id) {
            const confirmResult = await this.$confirm(
                "此操作将永久删除该类参数, 是否继续?",
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
                this.$http
                    .delete(`categories/${this.cateId}/attributes/${id}`)
                    .then((res) => {
                        if (res.status !== 200)
                            return this.$message.error(res.data.meta.msg);
                        this.$message.success(res.data.meta.msg);
                        this.getParamsData();
                    });
            }
        },
        handleInputConfirm(row) {
            if (row.inputValue.trim().length) {
                row.attr_vals.push(row.inputValue.trim());
                this.saveAttrVals(row)
            }
            row.inputValue = "";
            row.inputVisible = false;
        },
        showInput(row) {
            row.inputVisible = true;
            this.$nextTick((_) => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        handleClose(i, row) {
            row.attr_vals.splice(i, 1);
            this.saveAttrVals(row)
        },
        async saveAttrVals(row) {
            const { data: res } = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                    attr_name: row.attr_name,
                    attr_vals: row.attr_vals.join(","),
                    attr_sel: row.attr_sel,
                }
            );
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg);
        },
    },
    created() {
        this.getCateList();
    },
};
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
.el-tag {
    margin: 5px 10px;
}
.input-new-tag {
    width: 150px;
}
</style>